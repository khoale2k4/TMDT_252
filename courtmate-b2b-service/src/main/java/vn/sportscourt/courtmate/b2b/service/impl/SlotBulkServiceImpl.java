package vn.sportscourt.courtmate.b2b.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.sportscourt.courtmate.b2b.dto.request.SlotBulkGenerateRequest;
import vn.sportscourt.courtmate.b2b.dto.request.SlotBulkPriceRequest;
import vn.sportscourt.courtmate.b2b.dto.request.SlotBulkStatusRequest;
import vn.sportscourt.courtmate.b2b.dto.request.SlotPatchRequest;
import vn.sportscourt.courtmate.b2b.dto.response.*;
import vn.sportscourt.courtmate.b2b.entity.Court;
import vn.sportscourt.courtmate.b2b.entity.Slot;
import vn.sportscourt.courtmate.b2b.enums.SlotStatus;
import vn.sportscourt.courtmate.b2b.exception.AppException;
import vn.sportscourt.courtmate.b2b.exception.ErrorCode;
import vn.sportscourt.courtmate.b2b.mapper.SlotMapper;
import vn.sportscourt.courtmate.b2b.repository.CourtRepository;
import vn.sportscourt.courtmate.b2b.repository.SlotBulkRepository;
import vn.sportscourt.courtmate.b2b.repository.SlotRepository;
import vn.sportscourt.courtmate.b2b.service.AuditLogService;
import vn.sportscourt.courtmate.b2b.service.SlotBulkService;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SlotBulkServiceImpl implements SlotBulkService {

    private final SlotRepository slotRepository;
    private final SlotBulkRepository slotBulkRepository;
    private final CourtRepository courtRepository;
    private final SlotMapper slotMapper;
    private final AuditLogService auditLogService;

    // ── Bulk Generate ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public SlotBulkGenerateResponse bulkGenerate(UUID courtId, SlotBulkGenerateRequest request, UUID requesterId) {
        Court court = getCourtOrThrow(courtId);

        if (request.getDateFrom().isAfter(request.getDateTo())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    Map.of("dateFrom", "dateFrom phải trước hoặc bằng dateTo"));
        }

        if (request.getDateTo().isAfter(request.getDateFrom().plusMonths(3))) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    Map.of("dateRange", "Khoảng thời gian tối đa 3 tháng"));
        }

        // Build set of allowed day-of-week from request
        Set<DayOfWeek> allowedDays = parseDays(request.getApplyToDays());

        // Load existing slots in range to detect duplicates fast via a set
        List<Slot> existing = slotBulkRepository.findByCourtAndDateRange(
                courtId, request.getDateFrom(), request.getDateTo());

        Set<String> existingKeys = existing.stream()
                .map(s -> s.getDate() + "|" + s.getStartTime())
                .collect(Collectors.toSet());

        // Check conflicts when skipExisting = false
        if (!request.isSkipExisting() && !existingKeys.isEmpty()) {
            throw new AppException(ErrorCode.SLOTS_ALREADY_EXIST,
                    Map.of("existingCount", existingKeys.size()));
        }

        // Build all (date, timeSlot) candidates
        List<Slot> toInsert = new ArrayList<>();
        List<SlotBulkGenerateResponse.SlotPreview> preview = new ArrayList<>();
        int skipped = 0;

        LocalDate cursor = request.getDateFrom();
        while (!cursor.isAfter(request.getDateTo())) {

            if (allowedDays.contains(cursor.getDayOfWeek())) {

                for (SlotBulkGenerateRequest.TimeSlotRange ts : request.getTimeSlots()) {
                    String key = cursor + "|" + ts.getStart();

                    if (existingKeys.contains(key)) {
                        if (!request.isSkipExisting()) {
                            throw new AppException(ErrorCode.SLOTS_ALREADY_EXIST,
                                    Map.of("conflict_date", cursor.toString(),
                                            "conflict_time", ts.getStart().toString(),
                                            "message", "Phát hiện slot trùng lặp và skip_existing = false"));
                        }
                        skipped++;
                        continue;
                    }

                    Slot slot = Slot.builder()
                            .court(court)
                            .date(cursor)
                            .startTime(ts.getStart())
                            .endTime(ts.getEnd())
                            .price(request.getBasePrice())
                            .status(SlotStatus.available)
                            .build();
                    toInsert.add(slot);

                    if (preview.size() < 2) {
                        preview.add(SlotBulkGenerateResponse.SlotPreview.builder()
                                .date(cursor)
                                .startTime(ts.getStart())
                                .endTime(ts.getEnd())
                                .price(request.getBasePrice())
                                .build());
                    }
                }
            }
            cursor = cursor.plusDays(1);
        }

        slotBulkRepository.saveAll(toInsert);

        auditLogService.log(
        "slots", courtId,
            "bulk_generate",
                null,
                        Map.of("created", toInsert.size(),"skipped", skipped),
            null, requesterId);

        String monthYear = request.getDateFrom().getMonthValue() + "/" + request.getDateFrom().getYear();
        String messageStr = "Tạo thành công " + toInsert.size() + " slot cho tháng " + monthYear + ".";

        return SlotBulkGenerateResponse.builder()
                .courtId(courtId)
                .createdCount(toInsert.size())
                .skippedCount(skipped)
                .failedCount(0)
                .dateRange(SlotBulkGenerateResponse.DateRange.builder()
                        .from(request.getDateFrom())
                        .to(request.getDateTo())
                        .build())
                .preview(preview)
                .message(messageStr)
                .build();
    }

    // ── Bulk Update Price ─────────────────────────────────────────────────

    @Override
    @Transactional
    public APIResponse<Object> bulkUpdatePrice(UUID courtId, SlotBulkPriceRequest request, UUID requesterId) {
        getCourtOrThrow(courtId);

        Set<DayOfWeek> allowedDays = parseDays(request.getApplyToDays());

        List<Integer> isoDays = allowedDays.stream()
                .map(DayOfWeek::getValue)
                .toList();

        int updated = slotBulkRepository.bulkUpdatePrice(
                courtId,
                request.getDateFrom(), request.getDateTo(),
                request.getTimeFrom(), request.getTimeTo(),
                request.getNewPrice(),
                isoDays
        );

        auditLogService.log("slots", courtId, "bulk_update_price",
                null, Map.of("newPrice", request.getNewPrice(), "updatedCount", updated),
                null, requesterId);

        return APIResponse.ok(Map.of(
                "updated_count", updated,
                "new_price", request.getNewPrice(),
                "message", "Đã cập nhật giá cho " + updated + " slot."
        ));
    }

    // ── Bulk Set Status ───────────────────────────────────────────────────

    @Override
    @Transactional
    public APIResponse<Object> bulkSetStatus(UUID courtId, SlotBulkStatusRequest request, UUID requesterId) {
        getCourtOrThrow(courtId);

        List<UUID> slotIdsToUpdate = slotBulkRepository.findIdsForStatusUpdate(
                courtId, request.getDateFrom(), request.getDateTo(),
                request.getTimeFrom(), request.getTimeTo()
        );

        int updated = 0;
        if (!slotIdsToUpdate.isEmpty()) {
            updated = slotBulkRepository.bulkUpdateStatusByIds(slotIdsToUpdate, request.getNewStatus());
        }

        long bookedSkipped = slotBulkRepository.countBookedInRange(
                courtId, request.getDateFrom(), request.getDateTo(),
                request.getTimeFrom(), request.getTimeTo());

        auditLogService.log("slots", courtId, "bulk_status_update",
                null,
                Map.of("newStatus", request.getNewStatus().name(),
                        "updatedCount", updated,
                        "updatedIds", slotIdsToUpdate),
                request.getReason(), requesterId);

        return APIResponse.ok(Map.of(
                "updated_count", updated,
                "skipped_booked_count", bookedSkipped,
                "new_status", request.getNewStatus().name(),
                "message", "Đã cập nhật " + updated + " slot. Bỏ qua " + bookedSkipped + " slot đã có booking."
        ));
    }

    // ── List Slots by Court ───────────────────────────────────────────────

    @Override
    public CourtSlotListResponse listByCourtFiltered(
            UUID courtId, LocalDate dateFrom, LocalDate dateTo, SlotStatus status, int page, int size) {

        getCourtOrThrow(courtId);

        Pageable pageable = PageRequest.of(page - 1, size,
                Sort.by("date").ascending()
                .and(Sort.by("startTime").ascending()));

        Page<Slot> slotPage = slotBulkRepository.findByCourtFiltered(
                                courtId,
                                dateFrom,
                                dateTo,
                                status != null,
                                status,
                                pageable
                            );

        List<SlotResponse> slotResponses = slotPage.getContent().stream()
                .map(slotMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());

        CourtSlotListResponse.PaginationMeta paginationMeta = CourtSlotListResponse.PaginationMeta.builder()
                .page(page)
                .total(slotPage.getTotalElements())
                .totalPages(slotPage.getTotalPages())
                .build();

        return CourtSlotListResponse.builder()
                .courtId(courtId)
                .slots(slotResponses)
                .pagination(paginationMeta)
                .build();
    }

    // ── Unified Slot Patch ────────────────────────────────────────────────

    @Override
    @Transactional
    public SlotPatchResponse patchSlot(UUID slotId, SlotPatchRequest request, UUID requesterId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));

        if (!slot.getVersion().equals(request.getExpectedVersion())) {
            throw new AppException(ErrorCode.SLOT_VERSION_CONFLICT,
                    Map.of("current_version", slot.getVersion(),
                            "expected_version", request.getExpectedVersion(),
                            "message", "Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại trang."));
        }

        UUID auditId = UUID.randomUUID();
        Object before = Map.of("status", slot.getStatus().name(), "version", slot.getVersion());

        return switch (request.getAction().toLowerCase()) {
            case "reschedule"      -> doReschedule(slot, request, requesterId, auditId, before);
            case "set_maintenance" -> doSetMaintenance(slot, request, requesterId, auditId, before);
            case "restore"         -> doRestore(slot, request, requesterId, auditId, before);
            default -> throw new AppException(ErrorCode.VALIDATION_ERROR,
                    Map.of("action", "Action không hợp lệ. Hợp lệ: reschedule | set_maintenance | restore"));
        };
    }

    // ── Private action handlers ───────────────────────────────────────────

    private SlotPatchResponse doReschedule(Slot slot, SlotPatchRequest req, UUID requesterId, UUID auditId, Object before) {
        if (slot.getStatus() != SlotStatus.booked) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    Map.of("current_status", slot.getStatus().name(),
                            "message", "Chỉ có thể đổi lịch cho slot đã được đặt (booked)."));
        }

        if (req.getNewSlotId() == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    Map.of("new_slot_id", "Bắt buộc phải có new_slot_id khi action là reschedule"));
        }

        Slot newSlot = slotRepository.findById(req.getNewSlotId())
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND,
                        Map.of("new_slot_id", "Không tìm thấy slot mới")));

        if (newSlot.getStatus() != SlotStatus.available) {
            throw new AppException(ErrorCode.SLOT_UNAVAILABLE,
                    Map.of("new_slot_id", req.getNewSlotId(),
                            "current_status", newSlot.getStatus().name(),
                            "message", "Slot mới không ở trạng thái available"));
        }

        slot.setStatus(SlotStatus.available);
        newSlot.setStatus(SlotStatus.booked);

        slotRepository.save(slot);
        Slot savedNew = slotRepository.save(newSlot);

        auditLogService.log("slots", slot.getId(), "reschedule",
                before, Map.of("new_slot_id", req.getNewSlotId(), "status", "booked"),
                req.getReason(), requesterId);

        return SlotPatchResponse.builder()
                .slotId(slot.getId())
                .newSlotId(req.getNewSlotId())
                .action("reschedule")
                .newVersion(slot.getVersion())
                .auditLogId(auditId)
                .customerNotified(req.isNotifyCustomer())
                .message("Đổi lịch thành công.")
                .build();
    }

    private SlotPatchResponse doSetMaintenance(Slot slot, SlotPatchRequest req, UUID requesterId, UUID auditId, Object before) {
        if (slot.getStatus() == SlotStatus.booked) {
            throw new AppException(ErrorCode.SLOT_UNAVAILABLE,
                    Map.of("message", "Slot đã có khách đặt, không thể chuyển sang bảo trì. " +
                            "Vui lòng hủy lịch hoặc đổi lịch trước."));
        }

        slot.setStatus(SlotStatus.maintenance);
        Slot saved = slotRepository.save(slot);

        auditLogService.log("slots", slot.getId(), "set_maintenance",
                before, Map.of("status", "maintenance"), req.getReason(), requesterId);

        return SlotPatchResponse.builder()
                .slotId(slot.getId())
                .action("set_maintenance")
                .newVersion(saved.getVersion())
                .auditLogId(auditId)
                .customerNotified(false)
                .message("Đã đặt slot sang trạng thái bảo trì.")
                .build();
    }

    private SlotPatchResponse doRestore(Slot slot, SlotPatchRequest req, UUID requesterId, UUID auditId, Object before) {
        if (slot.getStatus() != SlotStatus.maintenance && slot.getStatus() != SlotStatus.locked) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    Map.of("current_status", slot.getStatus().name(),
                            "message", "Chỉ slot đang bảo trì hoặc bị khóa mới có thể khôi phục"));
        }

        slot.setStatus(SlotStatus.available);
        Slot saved = slotRepository.save(slot);

        auditLogService.log("slots", slot.getId(), "restore",
                before, Map.of("status", "available"), req.getReason(), requesterId);

        return SlotPatchResponse.builder()
                .slotId(slot.getId())
                .action("restore")
                .newVersion(saved.getVersion())
                .auditLogId(auditId)
                .customerNotified(false)
                .message("Đã khôi phục slot sang trạng thái sẵn sàng.")
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private Court getCourtOrThrow(UUID id) {
        return courtRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURT_NOT_FOUND));
    }

    private Set<DayOfWeek> parseDays(List<String> days) {
        if (days == null || days.isEmpty()) return EnumSet.allOf(DayOfWeek.class);
        Map<String, DayOfWeek> map = Map.of(
                "monday", DayOfWeek.MONDAY, "tuesday", DayOfWeek.TUESDAY,
                "wednesday", DayOfWeek.WEDNESDAY, "thursday", DayOfWeek.THURSDAY,
                "friday", DayOfWeek.FRIDAY, "saturday", DayOfWeek.SATURDAY,
                "sunday", DayOfWeek.SUNDAY
        );
        return days.stream()
                .map(d -> {
                    DayOfWeek dow = map.get(d.toLowerCase());
                    if (dow == null) throw new AppException(ErrorCode.VALIDATION_ERROR,
                            Map.of("applyToDays", "Ngày không hợp lệ: " + d));
                    return dow;
                })
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(DayOfWeek.class)));
    }
}
