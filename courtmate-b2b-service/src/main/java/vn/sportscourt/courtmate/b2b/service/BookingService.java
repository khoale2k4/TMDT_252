package vn.sportscourt.courtmate.b2b.service;

import vn.sportscourt.courtmate.b2b.dto.request.*;
import vn.sportscourt.courtmate.b2b.dto.response.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BookingService {
    /** POST /admin/bookings/walk-in — single slot, optimistic lock via expectedVersion */
    WalkInResponse walkIn(WalkInRequest request, UUID staffId);

    /** GET /admin/bookings/{id} */
    BookingDetailResponse findById(UUID id);

    /** GET /admin/venues/{venueId}/bookings — with filters */
    List<BookingResponse> findByVenue(UUID venueId, LocalDate dateFrom, LocalDate dateTo,
                                      String status, String search, int page, int limit);

    VenueBookingListResponse getVenueBookings(
            UUID venueId, LocalDate dateFrom, LocalDate dateTo,
            String statusStr, String paymentStatusStr, String search,
            String sportType, UUID courtId, int page, int limit);

    /** POST /admin/bookings/{id}/cancel — full | partial | none refund */
    CancelBookingResponse cancel(UUID id, CancelBookingRequest request, UUID requesterId);

    /** POST /admin/bookings/{id}/checkin */
    CheckInResponse checkIn(UUID id, CheckInRequest request, UUID staffId);
}
