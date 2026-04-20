package vn.sportscourt.courtmate.b2b.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.sportscourt.courtmate.b2b.dto.request.SlotMaintenanceRequest;
import vn.sportscourt.courtmate.b2b.dto.request.SlotRescheduleRequest;
import vn.sportscourt.courtmate.b2b.dto.response.CalendarGridResponse;
import vn.sportscourt.courtmate.b2b.dto.response.SlotDetailResponse;
import vn.sportscourt.courtmate.b2b.dto.response.SlotResponse;
import vn.sportscourt.courtmate.b2b.entity.Slot;
import vn.sportscourt.courtmate.b2b.enums.SlotStatus;
import vn.sportscourt.courtmate.b2b.exception.AppException;
import vn.sportscourt.courtmate.b2b.exception.ErrorCode;
import vn.sportscourt.courtmate.b2b.mapper.SlotMapper;
import vn.sportscourt.courtmate.b2b.repository.SlotRepository;
import vn.sportscourt.courtmate.b2b.service.AuditLogService;
import vn.sportscourt.courtmate.b2b.service.SlotService;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final SlotMapper slotMapper;
    private final AuditLogService auditLogService;

    public SlotDetailResponse getSlotDetail(UUID slotId) {
        Slot slot = slotRepository.findSlotDetailById(slotId)
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));

        return SlotDetailResponse.builder()
                .slotId(slot.getId())
                .courtId(slot.getCourt().getId())
                .courtName(slot.getCourt().getName())
                .date(slot.getDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(slot.getStatus())
                .price(slot.getPrice())
                .version(slot.getVersion())
                .build();
    }


    // ── Calendar Grid ─────────────────────────────────────────────────────

    @Override
    public CalendarGridResponse getCalendarGrid(UUID venueId, LocalDate from, LocalDate to) {
        List<Slot> slots = slotRepository.findByVenueAndDateRange(venueId, from, to);

        Map<UUID, List<Slot>> byCourt = new LinkedHashMap<>();

        int booked = 0, available = 0, locked = 0, maintenance = 0;
        long revenueToday = 0;

        for (Slot slot : slots) {
            byCourt.computeIfAbsent(slot.getCourt().getId(), k -> new ArrayList<>()).add(slot);

            switch (slot.getStatus()) {
                case booked -> {
                    booked++;
                    revenueToday += slot.getPrice();
                }
                case available -> available++;
                case locked -> locked++;
                case maintenance -> maintenance++;
            }
        }

        List<CalendarGridResponse.CourtColumn> columns = byCourt.entrySet().stream()
                .map(entry -> {
                    Slot first = entry.getValue().get(0);
                    return CalendarGridResponse.CourtColumn.builder()
                            .courtId(entry.getKey())
                            .courtName(first.getCourt().getName())
                            .slots(entry.getValue().stream()
                                    .map(slotMapper::toResponse)
                                    .collect(Collectors.toList()))
                            .build();
                })
                .collect(Collectors.toList());

        int totalSlots = slots.size();
        double occupancyRate = 0.0;
        if (totalSlots > 0) { occupancyRate = Math.round(((double) booked / totalSlots) * 10000.0) / 100.0; }

        CalendarGridResponse.GridSummary summary = CalendarGridResponse.GridSummary.builder()
                .totalSlots(totalSlots)
                .booked(booked)
                .available(available)
                .locked(locked)
                .maintenance(maintenance)
                .occupancyRate(occupancyRate)
                .revenueToday(revenueToday)
                .build();

        return CalendarGridResponse.builder()
                .venueId(venueId)
                .date(from)
                .courts(columns)
                .summary(summary)
                .build();
    }

    // ── Reschedule ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public SlotResponse reschedule(UUID slotId, SlotRescheduleRequest request, UUID requesterId) {
        Slot slot = getOrThrow(slotId);

        // Only available slots can be rescheduled
        if (slot.getStatus() == SlotStatus.booked) {
            throw new AppException(ErrorCode.SLOT_UNAVAILABLE);
        }
        if (slot.getStatus() == SlotStatus.locked) {
            throw new AppException(ErrorCode.SLOT_LOCKED);
        }

        // Check for time overlap with other slots on the same court/date
        List<Slot> overlapping = slotRepository.findOverlapping(
                slot.getCourt().getId(),
                request.getNewDate(),
                request.getNewStartTime(),
                request.getNewEndTime(),
                slotId
        );
        if (!overlapping.isEmpty()) {
            throw new AppException(ErrorCode.SLOT_OVERLAP);
        }

        Object before = snapshotOf(slot);

        slot.setDate(request.getNewDate());
        slot.setStartTime(request.getNewStartTime());
        slot.setEndTime(request.getNewEndTime());
        if (request.getNewPrice() != null) {
            slot.setPrice(request.getNewPrice());
        }

        Slot saved = slotRepository.save(slot);
        auditLogService.log("slots", slotId, "reschedule", before, saved, request.getReason(), requesterId);
        return slotMapper.toResponse(saved);
    }

    // ── Maintenance ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public SlotResponse setMaintenance(UUID slotId, SlotMaintenanceRequest request, UUID requesterId) {
        Slot slot = getOrThrow(slotId);

        if (slot.getStatus() == SlotStatus.booked) {
            throw new AppException(ErrorCode.SLOT_UNAVAILABLE);
        }

        Object before = snapshotOf(slot);
        slot.setStatus(SlotStatus.maintenance);
        Slot saved = slotRepository.save(slot);
        auditLogService.log("slots", slotId, "maintenance", before, saved, request.getReason(), requesterId);
        return slotMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public SlotResponse restoreFromMaintenance(UUID slotId, UUID requesterId) {
        Slot slot = getOrThrow(slotId);

        if (slot.getStatus() != SlotStatus.maintenance) {
            throw new AppException(ErrorCode.SLOT_UNAVAILABLE,
                    Map.of("currentStatus", slot.getStatus().name()));
        }

        Object before = snapshotOf(slot);
        slot.setStatus(SlotStatus.available);
        Slot saved = slotRepository.save(slot);
        auditLogService.log("slots", slotId, "restore", before, saved, null, requesterId);
        return slotMapper.toResponse(saved);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private Slot getOrThrow(UUID id) {
        return slotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));
    }

    private Object snapshotOf(Slot s) {
        return Map.of(
                "date", s.getDate().toString(),
                "startTime", s.getStartTime().toString(),
                "endTime", s.getEndTime().toString(),
                "price", s.getPrice(),
                "status", s.getStatus().name()
        );
    }
}
