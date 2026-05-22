package vn.sportscourt.courtmate.b2b.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.sportscourt.courtmate.b2b.dto.request.VenueRequest;
import vn.sportscourt.courtmate.b2b.dto.request.VenueStatusRequest;
import vn.sportscourt.courtmate.b2b.dto.request.VenueUpdateRequest;
import vn.sportscourt.courtmate.b2b.dto.response.VenueCreateResponse;
import vn.sportscourt.courtmate.b2b.dto.response.VenueResponse;
import vn.sportscourt.courtmate.b2b.dto.response.VenueStatusResponse;
import vn.sportscourt.courtmate.b2b.dto.response.VenueUpdateResponse;
import vn.sportscourt.courtmate.b2b.entity.Users;
import vn.sportscourt.courtmate.b2b.entity.Venue;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;
import vn.sportscourt.courtmate.b2b.enums.VenueStatus;
import vn.sportscourt.courtmate.b2b.exception.AppException;
import vn.sportscourt.courtmate.b2b.exception.ErrorCode;
import vn.sportscourt.courtmate.b2b.mapper.VenueMapper;
import vn.sportscourt.courtmate.b2b.repository.BookingRepository;
import vn.sportscourt.courtmate.b2b.repository.VenueRepository;
import vn.sportscourt.courtmate.b2b.service.AuditLogService;
import vn.sportscourt.courtmate.b2b.service.VenueService;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VenueServiceImpl implements VenueService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;
    private final AuditLogService auditLogService;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public VenueCreateResponse create(VenueRequest request, UUID ownerId) {
        Venue venue = venueMapper.toEntity(request);

        venue.setOwner(Users.builder().id(ownerId).build());
        venue.setCreatedAt(OffsetDateTime.now());
        venue.setUpdatedAt(OffsetDateTime.now());

        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 4);
        venue.setSlug(generateSlug(request.getName()) + "-" + uniqueSuffix);

        Venue saved = venueRepository.save(venue);

        auditLogService.log(
                "venues", saved.getId(),
                "create", null, saved,
                null, ownerId);
        return venueMapper.toCreateResponse(saved);
    }

    @Override
    public VenueResponse findById(UUID id) {
        return venueMapper.toResponse(getOrThrow(id));
    }

    @Override
    public List<VenueResponse> findByOwner(UUID ownerId) {
        return venueRepository.findByOwnerId(ownerId)
                .stream()
                .map(venueMapper::toResponse)
                .collect(Collectors.toList());
    }


    @Override
    public List<VenueResponse> getAllVenues() {
        return venueRepository.findAll()
                .stream()
                .map(venueMapper::toResponse)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public VenueUpdateResponse update(UUID id, VenueUpdateRequest request, UUID requesterId) {
        Venue venue = getOrThrow(id);

        VenueResponse before = venueMapper.toResponse(venue);

        List<String> updatedFields = detectChangedFields(venue, request);

        venueMapper.updateEntity(request, venue);
        Venue saved = venueRepository.save(venue);

        VenueResponse after = venueMapper.toResponse(saved);

        auditLogService.log(
                "venues", id,
                "update", before, after,
                null, requesterId);

        return VenueUpdateResponse.builder()
                .venueId(saved.getId())
                .updatedFields(updatedFields)
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public VenueStatusResponse patchStatus(UUID id, VenueStatusRequest request, UUID requesterId) {

        // TODO: Bổ sung logic kiểm tra JWT + RBAC (role: owner) ở đây hoặc xử lý ở tầng Controller/Filter.

        Venue venue = getOrThrow(id);
        String oldStatus = venue.getStatus().name();

        VenueStatus newStatus = switch (request.getStatus().toLowerCase()) {
            case "active"    -> VenueStatus.active;
            case "closed"    -> VenueStatus.closed;
            case "suspended" -> VenueStatus.suspended;
            default -> throw new AppException(ErrorCode.VALIDATION_ERROR,
                    Map.of("status", "Giá trị không hợp lệ: " + request.getStatus()
                            + ". Hợp lệ: active | closed | suspended"));
        };

        venue.setStatus(newStatus);
        venueRepository.save(venue);

        long affectedBookings = 0;
        if (newStatus != VenueStatus.active) {
            affectedBookings = bookingRepository.countUpcomingByVenue(id,
                    List.of(BookingStatus.pending_payment, BookingStatus.confirmed));
        }

        auditLogService.log("venues", id, "status_changed",
                Map.of("status", oldStatus),
                Map.of("status", newStatus.name()),
                request.getReason(), requesterId);

        String msg = newStatus == VenueStatus.active
                ? "Venue đã mở lại."
                : "Venue đã " + newStatus.name() + ". " + affectedBookings + " booking sắp tới cần được xử lý.";

        return VenueStatusResponse.builder()
                .venueId(id)
                .oldStatus(oldStatus)
                .newStatus(newStatus.name())
                .reopenAt(request.getReopenAt())
                .affectedBookings((int) affectedBookings)
                .message(msg)
                .build();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID requesterId) {
        Venue venue = getOrThrow(id);
        venueRepository.delete(venue);
        auditLogService.log(
                "venues", id,
                "delete", snapshotOf(venue), null,
                null, requesterId
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private Venue getOrThrow(UUID id) {
        return venueRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VENUE_NOT_FOUND));
    }

    private Object snapshotOf(Venue v) {
        return Map.of(
                "name", v.getName(),
                "status", v.getStatus().name(),
                "address", v.getAddress()
        );
    }

    private List<String> detectChangedFields(Venue venue, VenueUpdateRequest req) {
        List<String> changed = new ArrayList<>();
        if (req.getName()        != null && !req.getName().equals(venue.getName()))         changed.add("name");
        if (req.getDescription() != null && !req.getDescription().equals(venue.getDescription())) changed.add("description");
        if (req.getAddress()     != null && !req.getAddress().equals(venue.getAddress()))   changed.add("address");
        if (req.getPhone()       != null && !req.getPhone().equals(venue.getPhone()))       changed.add("phone");
        if (req.getEmail()       != null && !req.getEmail().equals(venue.getEmail()))       changed.add("email");
        if (req.getLat()         != null)                                                    changed.add("lat");
        if (req.getLng()         != null)                                                    changed.add("lng");
        if (req.getWorkingHours()!= null)                                                    changed.add("working_hours");
        if (req.getAmenities()   != null)                                                    changed.add("amenities");
        if (req.getBankAccount() != null)                                                    changed.add("bank_account");
        return changed;
    }

    private String generateSlug(String input) {
        if (input == null || input.isEmpty()) return "";
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD);
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase()
                .replace("đ", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-").trim();
    }
}
