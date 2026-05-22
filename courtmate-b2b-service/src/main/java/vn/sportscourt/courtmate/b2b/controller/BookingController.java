package vn.sportscourt.courtmate.b2b.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.sportscourt.courtmate.b2b.dto.request.*;
import vn.sportscourt.courtmate.b2b.dto.response.*;
import vn.sportscourt.courtmate.b2b.service.BookingService;
import vn.sportscourt.courtmate.b2b.service.InvoiceService;

import java.util.UUID;

/**
 * POST /admin/bookings/walk-in                  – Walk-in (Staff+)
 * GET  /admin/bookings/{bookingId}              – Chi tiết booking (Staff+)
 * GET  /admin/venues/{venueId}/bookings         – Danh sách booking (Staff+)
 * POST /admin/bookings/{bookingId}/cancel       – Hủy booking (Manager+)
 * POST /admin/bookings/{bookingId}/checkin      – Check-in (Staff+)
 * Booking FSM:
 *   pending_payment ──[WALK_IN]──► confirmed ──[CHECK_IN]──► completed
 *                                       └──[CANCEL]──► cancelled
 */
@RestController
@RequestMapping("/admin/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final InvoiceService invoiceService;

    // ── Walk-in ───────────────────────────────────────────────────────────
    @PostMapping("/walk-in")
    public ResponseEntity<APIResponse<WalkInResponse>> walkIn(
            @Valid @RequestBody WalkInRequest request,
            @RequestHeader("X-User-Id") UUID staffId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(APIResponse.ok(bookingService.walkIn(request, staffId), "Walk-in booking tạo thành công"));
    }

    // ── Read ──────────────────────────────────────────────────────────────
    @GetMapping("/{bookingId}")
    public ResponseEntity<APIResponse<BookingDetailResponse>> findById(@PathVariable UUID bookingId) {
        return ResponseEntity.ok(APIResponse.ok(bookingService.findById(bookingId)));
    }

    // ── Cancel ────────────────────────────────────────────────────────────
    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<APIResponse<CancelBookingResponse>> cancel(
            @PathVariable UUID bookingId,
            @RequestBody(required = false) CancelBookingRequest request,
            @RequestHeader("X-User-Id") UUID requesterId) {
        CancelBookingRequest req = request != null ? request : new CancelBookingRequest();
        return ResponseEntity.ok(APIResponse.ok(
                bookingService.cancel(bookingId, req, requesterId)));
    }

    // ── Check-in ──────────────────────────────────────────────────────────
    @PostMapping("/{bookingId}/checkin")
    public ResponseEntity<APIResponse<CheckInResponse>> checkIn(
            @PathVariable UUID bookingId,
            @RequestBody(required = false) CheckInRequest request,
            @RequestHeader("X-User-Id") UUID staffId) {
        CheckInRequest req = request != null ? request : new CheckInRequest();
        return ResponseEntity.ok(APIResponse.ok(
                bookingService.checkIn(bookingId, req, staffId), "Check-in thành công"));
    }

    // ── Invoice ───────────────────────────────────────────────────────────
    @PostMapping("/{bookingId}/invoice")
    public ResponseEntity<APIResponse<InvoiceResponse>> issueInvoice(
            @PathVariable UUID bookingId,
            @RequestHeader("X-User-Id") UUID requesterId) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(APIResponse.ok(invoiceService.issue(bookingId, requesterId), "Xuất hoá đơn thành công"));
    }

    @GetMapping("/{bookingId}/invoice")
    public ResponseEntity<APIResponse<InvoiceResponse>> getInvoiceByBooking(
            @PathVariable UUID bookingId) {
        return ResponseEntity.ok(APIResponse.ok(invoiceService.findByBooking(bookingId)));
    }
}
