package vn.sportscourt.courtmate.b2b.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.sportscourt.courtmate.b2b.dto.request.CourtRequest;
import vn.sportscourt.courtmate.b2b.dto.request.CourtUpdateRequest;
import vn.sportscourt.courtmate.b2b.dto.response.CourtCreateResponse;
import vn.sportscourt.courtmate.b2b.dto.response.CourtDeleteResponse;
import vn.sportscourt.courtmate.b2b.dto.response.CourtResponse;
import vn.sportscourt.courtmate.b2b.dto.response.CourtUpdateResponse;
import vn.sportscourt.courtmate.b2b.entity.Court;
import vn.sportscourt.courtmate.b2b.entity.Venue;
import vn.sportscourt.courtmate.b2b.exception.AppException;
import vn.sportscourt.courtmate.b2b.exception.ErrorCode;
import vn.sportscourt.courtmate.b2b.mapper.CourtMapper;
import vn.sportscourt.courtmate.b2b.repository.CourtRepository;
import vn.sportscourt.courtmate.b2b.repository.VenueRepository;
import vn.sportscourt.courtmate.b2b.service.AuditLogService;
import vn.sportscourt.courtmate.b2b.service.CourtService;

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
public class CourtServiceImpl implements CourtService {

    private final CourtRepository courtRepository;
    private final VenueRepository venueRepository;
    private final CourtMapper courtMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public CourtCreateResponse create(UUID venueId, CourtRequest request, UUID requesterId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new AppException(ErrorCode.VENUE_NOT_FOUND));

        // court_name unique per venue (UNIQUE constraint in DB)
        if (courtRepository.existsByVenueIdAndName(venueId, request.getName())) {
            throw new AppException(ErrorCode.COURT_NAME_DUPLICATE,
                    Map.of("courtName", request.getName(), "venueId", venueId));
        }

        Court court = courtMapper.toEntity(request);
        court.setVenue(venue);
        court.setCreatedAt(OffsetDateTime.now());
        court.setUpdatedAt(OffsetDateTime.now());
        Court saved = courtRepository.save(court);

        auditLogService.log(
                "courts", saved.getId(),
                "create", null, snapshotOf(saved),
                null, requesterId);

        return courtMapper.toCreateResponse(saved);
    }

    @Override
    public CourtResponse findById(UUID id) {
        return courtMapper.toResponse(getOrThrow(id));
    }

    @Override
    public List<CourtResponse> findByVenue(UUID venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new AppException(ErrorCode.VENUE_NOT_FOUND);
        }
        return courtRepository.findByVenueId(venueId)
                .stream()
                .map(courtMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CourtUpdateResponse update(UUID id, CourtUpdateRequest request, UUID requesterId) {
        Court court = getOrThrow(id);
        Object before = snapshotOf(court);

        // Duplicate name check: ignore self, check other courts in same venue
        if (request.getName() != null
                && !request.getName().equals(court.getName())
                && courtRepository.existsByVenueIdAndCourtNameAndIdNot(
                court.getVenue().getId(), request.getName(), id)) {
            throw new AppException(ErrorCode.COURT_NAME_DUPLICATE,
                    Map.of("courtName", request.getName()));
        }

        List<String> updatedFields = detectChangedFields(court, request);
        courtMapper.updateEntity(request, court);
        Court saved = courtRepository.save(court);

        auditLogService.log("courts", id, "update", before, snapshotOf(saved), null, requesterId);

        return CourtUpdateResponse.builder()
                .courtId(saved.getId())
                .updatedFields(updatedFields)
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public CourtDeleteResponse delete(UUID id, UUID requesterId) {
        Court court = getOrThrow(id);

        long activeBookingsCount = courtRepository.countUpcomingBookedSlots(id);

        if (activeBookingsCount > 0) {
            throw new AppException(ErrorCode.COURT_HAS_ACTIVE_BOOKINGS,
                    Map.of("active_bookings_count", activeBookingsCount));
        }

        CourtResponse snapshot = courtMapper.toResponse(court);

        courtRepository.delete(court);

        auditLogService.log(
                "courts", id,
                "delete", snapshot, null,
                null, requesterId);

        return CourtDeleteResponse.builder()
                .courtId(id)
                .deleted(true)
                .message("Sân đã được xóa.")
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private Court getOrThrow(UUID id) {
        return courtRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURT_NOT_FOUND));
    }

    private List<String> detectChangedFields(Court court, CourtUpdateRequest req) {
        List<String> changed = new ArrayList<>();
        if (req.getName()   != null && !req.getName().equals(court.getName()))     changed.add("court_name");
        if (req.getSportType()   != null && !req.getSportType().equals(court.getSportType()))     changed.add("sport_type");
        if (req.getDescription() != null && !req.getDescription().equals(court.getDescription())) changed.add("description");
        if (req.getBasePrice()   != null && !req.getBasePrice().equals(court.getBasePrice()))     changed.add("base_price");
        if (req.getSurfaceType() != null && !req.getSurfaceType().equals(court.getSurfaceType())) changed.add("surface_type");
        if (req.getHasLighting() != null && !req.getHasLighting().equals(court.getHasLighting())) changed.add("has_lighting");
        if (req.getHasRoof()     != null && !req.getHasRoof().equals(court.getHasRoof()))         changed.add("has_roof");
        if (req.getMaxPlayers()  != null && !req.getMaxPlayers().equals(court.getMaxPlayers()))   changed.add("max_players");
        if (req.getImages()      != null)                                                          changed.add("images");
        if (req.getStatus()      != null && !req.getStatus().equals(court.getStatus()))           changed.add("status");
        return changed;
    }

    private Map<String, Object> snapshotOf(Court c) {
        return Map.of(
                "courtName", c.getName(),
                "sportType", c.getSportType(),
                "basePrice", c.getBasePrice() != null ? c.getBasePrice() : 0,
                "status",    c.getStatus().name()
        );
    }
}
