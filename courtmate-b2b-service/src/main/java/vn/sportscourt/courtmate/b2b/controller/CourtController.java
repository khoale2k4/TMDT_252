package vn.sportscourt.courtmate.b2b.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.sportscourt.courtmate.b2b.dto.request.CourtRequest;
import vn.sportscourt.courtmate.b2b.dto.request.CourtUpdateRequest;
import vn.sportscourt.courtmate.b2b.dto.response.*;
import vn.sportscourt.courtmate.b2b.service.CourtService;

import java.util.List;
import java.util.UUID;

/**
 * POST   /admin/venues/{venueId}/courts   – Tạo court (Manager+)
 * GET    /admin/venues/{venueId}/courts   – Danh sách court của venue (Staff+)
 * GET    /admin/courts/{courtId}          – Chi tiết court (Staff+)
 * PUT    /admin/courts/{courtId}          – Cập nhật court (Manager+)
 * DELETE /admin/courts/{courtId}          – Xoá court (Owner)
 */
@RestController
@RequestMapping
@RequiredArgsConstructor
public class CourtController {

    private final CourtService courtService;

    @PostMapping("/admin/venues/{venueId}/courts")
    public ResponseEntity<APIResponse<CourtCreateResponse>> create(
            @PathVariable UUID venueId,
            @Valid @RequestBody CourtRequest request,
            @RequestHeader("X-User-Id") UUID requesterId) {

        CourtCreateResponse body = courtService.create(venueId, request, requesterId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(APIResponse.ok(body, "Tạo sân thành công"));
    }

    @GetMapping("/admin/venues/{venueId}/courts")
    public ResponseEntity<APIResponse<List<CourtResponse>>> findByVenue(
            @PathVariable UUID venueId) {

        return ResponseEntity.ok(APIResponse.ok(courtService.findByVenue(venueId)));
    }

    @GetMapping("/admin/courts/{courtId}")
    public ResponseEntity<APIResponse<CourtResponse>> findById(
            @PathVariable UUID courtId) {

        return ResponseEntity.ok(APIResponse.ok(courtService.findById(courtId)));
    }

    @PutMapping("/admin/courts/{courtId}")
    public ResponseEntity<APIResponse<CourtUpdateResponse>> update(
            @PathVariable UUID courtId,
            @Valid @RequestBody CourtUpdateRequest request,
            @RequestHeader("X-User-Id") UUID requesterId) {

        CourtUpdateResponse body = courtService.update(courtId, request, requesterId);
        return ResponseEntity.ok(APIResponse.ok(body, "Cập nhật sân thành công"));
    }

    // Return 409 code if still have booking active
    @DeleteMapping("/admin/courts/{courtId}")
    public ResponseEntity<APIResponse<CourtDeleteResponse>> delete(
            @PathVariable UUID courtId,
            @RequestHeader("X-User-Id") UUID requesterId) {

        return ResponseEntity.ok(APIResponse.ok(courtService.delete(courtId, requesterId)));
    }
}
