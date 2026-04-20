package vn.sportscourt.courtmate.b2b.service;

import vn.sportscourt.courtmate.b2b.dto.request.VenueRequest;
import vn.sportscourt.courtmate.b2b.dto.request.VenueStatusRequest;
import vn.sportscourt.courtmate.b2b.dto.request.VenueUpdateRequest;
import vn.sportscourt.courtmate.b2b.dto.response.VenueCreateResponse;
import vn.sportscourt.courtmate.b2b.dto.response.VenueResponse;
import vn.sportscourt.courtmate.b2b.dto.response.VenueStatusResponse;
import vn.sportscourt.courtmate.b2b.dto.response.VenueUpdateResponse;

import java.util.List;
import java.util.UUID;

public interface VenueService {

    /** POST /admin/venues — returns trimmed create response per API doc 6.1 */
    VenueCreateResponse create(VenueRequest request, UUID ownerId);

    /** GET /admin/venues/{id} — full detail */
    VenueResponse findById(UUID id);

    /** GET /admin/venues?ownerId= */
    List<VenueResponse> findByOwner(UUID ownerId);

    /** PUT /admin/venues/{id} — returns updated_fields + updated_at per API doc 6.2 */
    VenueUpdateResponse update(UUID id, VenueUpdateRequest request, UUID requesterId);

    /** PATCH /admin/venues/{id}/status — API doc 6.3 */
    VenueStatusResponse patchStatus(UUID id, VenueStatusRequest request, UUID requesterId);

    /** DELETE /admin/venues/{id} */
    void delete(UUID id, UUID requesterId);

    List<VenueResponse> getAllVenues();
}
