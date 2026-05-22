package vn.sportscourt.courtmate.b2b.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.sportscourt.courtmate.b2b.dto.request.VenueRequest;
import vn.sportscourt.courtmate.b2b.dto.request.VenueStatusRequest;
import vn.sportscourt.courtmate.b2b.dto.request.VenueUpdateRequest;
import vn.sportscourt.courtmate.b2b.dto.response.*;
import vn.sportscourt.courtmate.b2b.service.BookingService;
import vn.sportscourt.courtmate.b2b.service.VenueService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * POST   /admin/venues                     – Tạo venue          (owner)
 * GET    /admin/venues/{venue_id}          – Chi tiết venue      (staff+)
 * GET    /admin/venues?ownerId=            – Danh sách theo owner (owner+)
 * PUT    /admin/venues/{venue_id}          – Cập nhật thông tin  (manager+)
 * PATCH  /admin/venues/{venue_id}/status   – Đóng / mở venue     (owner)
 * DELETE /admin/venues/{venue_id}          – Xoá venue           (owner)
 * GET    /admin/venues/{venueId}/bookings  – Danh sách booking (Staff+)
 */
@RestController
@RequestMapping("/admin/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;
    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<APIResponse<VenueCreateResponse>> create(
            @Valid @RequestBody VenueRequest request,
            @RequestHeader("X-User-Id") UUID requesterId) {

        VenueCreateResponse body = venueService.create(request, requesterId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(APIResponse.ok(body, "Tạo venue thành công"));
    }

    @GetMapping("/{venueId}")
    public ResponseEntity<APIResponse<VenueResponse>> findById(@PathVariable UUID venueId) {
        return ResponseEntity.ok(APIResponse.ok(venueService.findById(venueId)));
    }

    @GetMapping
    public ResponseEntity<APIResponse<List<VenueResponse>>> findByOwner(
            @RequestParam UUID ownerId) {
        return ResponseEntity.ok(APIResponse.ok(venueService.findByOwner(ownerId)));
    }

    @GetMapping("/{venueId}/bookings")
    public ResponseEntity<APIResponse<VenueBookingListResponse>> getVenueBookings(
            @PathVariable UUID venueId,
            @RequestParam(value = "date_from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(value = "date_to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String status,
            @RequestParam(value = "payment_status", required = false) String paymentStatus,
            @RequestParam(required = false) String search,
            @RequestParam(value = "sport_type", required = false) String sportType,
            @RequestParam(value = "court_id", required = false) UUID courtId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        return ResponseEntity.ok(APIResponse.ok(
                bookingService.getVenueBookings(venueId, dateFrom, dateTo, status, paymentStatus, search, sportType, courtId, page, limit)
        ));
    }

    @PutMapping("/{venueId}")
    public ResponseEntity<APIResponse<VenueUpdateResponse>> update(
            @PathVariable UUID venueId,
            @Valid @RequestBody VenueUpdateRequest request,
            @RequestHeader("X-User-Id") UUID requesterId) {

        VenueUpdateResponse body = venueService.update(venueId, request, requesterId);
        return ResponseEntity.ok(APIResponse.ok(body, "Cập nhật thành công"));
    }

    @PatchMapping("/{venueId}/status")
    public ResponseEntity<APIResponse<VenueStatusResponse>> patchStatus(
            @PathVariable UUID venueId,
            @Valid @RequestBody VenueStatusRequest request,
            @RequestHeader("X-User-Id") UUID requesterId) {

        VenueStatusResponse body = venueService.patchStatus(venueId, request, requesterId);
        return ResponseEntity.ok(APIResponse.ok(body));
    }

    @DeleteMapping("/{venueId}")
    public ResponseEntity<APIResponse<Void>> delete(
            @PathVariable UUID venueId,
            @RequestHeader("X-User-Id") UUID requesterId) {

        venueService.delete(venueId, requesterId);
        return ResponseEntity.ok(APIResponse.ok("Xoá venue thành công"));
    }
}
