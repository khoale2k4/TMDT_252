package vn.sportscourt.courtmate.b2b.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.sportscourt.courtmate.b2b.dto.response.APIResponse;
import vn.sportscourt.courtmate.b2b.dto.response.BookingResponse;
import vn.sportscourt.courtmate.b2b.dto.response.VenueBookingListResponse;
import vn.sportscourt.courtmate.b2b.service.BookingService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/venues/{venueId}/bookings")
@RequiredArgsConstructor
public class VenueBookingController {

    private final BookingService bookingService;

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
}
