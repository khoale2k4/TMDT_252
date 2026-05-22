package vn.sportscourt.courtmate.b2b.service;

import vn.sportscourt.courtmate.b2b.dto.request.CourtRequest;
import vn.sportscourt.courtmate.b2b.dto.request.CourtUpdateRequest;
import vn.sportscourt.courtmate.b2b.dto.response.CourtCreateResponse;
import vn.sportscourt.courtmate.b2b.dto.response.CourtDeleteResponse;
import vn.sportscourt.courtmate.b2b.dto.response.CourtResponse;
import vn.sportscourt.courtmate.b2b.dto.response.CourtUpdateResponse;

import java.util.List;
import java.util.UUID;

public interface CourtService {
    /** POST /admin/venues/{venueId}/courts → CourtCreateResponse (trimmed, API doc 6.4) */
    CourtCreateResponse create(UUID venueId, CourtRequest request, UUID requesterId);

    /** GET /admin/courts/{id} → CourtResponse (full detail) */
    CourtResponse findById(UUID id);

    /** GET /admin/venues/{venueId}/courts → List<CourtResponse> */
    List<CourtResponse> findByVenue(UUID venueId);

    /** PUT /admin/courts/{id} → CourtUpdateResponse (trimmed, API doc 6.5) */
    CourtUpdateResponse update(UUID id, CourtUpdateRequest request, UUID requesterId);

    /** DELETE /admin/courts/{id} — throws COURT_IN_USE (409) nếu còn booking */
    CourtDeleteResponse delete(UUID id, UUID requesterId);
}
