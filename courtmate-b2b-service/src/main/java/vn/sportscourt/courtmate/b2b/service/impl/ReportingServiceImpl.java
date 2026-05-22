package vn.sportscourt.courtmate.b2b.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.sportscourt.courtmate.b2b.dto.response.RevenueReportResponse;
import vn.sportscourt.courtmate.b2b.entity.Venue;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;
import vn.sportscourt.courtmate.b2b.exception.AppException;
import vn.sportscourt.courtmate.b2b.exception.ErrorCode;
import vn.sportscourt.courtmate.b2b.repository.BookingRepository;
import vn.sportscourt.courtmate.b2b.repository.VenueRepository;
import vn.sportscourt.courtmate.b2b.service.ReportingService;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportingServiceImpl implements ReportingService {

    private final BookingRepository bookingRepository;
    private final VenueRepository venueRepository;

    @Override
    public RevenueReportResponse revenueReport(UUID venueId, LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    Map.of("message", "Thiếu tham số 'from' hoặc 'to' để thống kê."));
        }
        if (from.isAfter(to)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    Map.of("message", "Ngày bắt đầu (from) không được lớn hơn ngày kết thúc (to)."));
        }
        
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new AppException(ErrorCode.VENUE_NOT_FOUND));
        
        Long totalRevenue = bookingRepository.sumRevenueByVenueAndDateRange(
                venueId, from, to, BookingStatus.completed);
        
        long totalBookings = bookingRepository.countBookingsByVenueAndDateRange(
                venueId, from, to, false, null);

        long completed = bookingRepository.countBookingsByVenueAndDateRange(
                venueId, from, to, true, BookingStatus.completed);

        long cancelled = bookingRepository.countBookingsByVenueAndDateRange(
                venueId, from, to, true, BookingStatus.cancelled);
        
        return RevenueReportResponse.builder()
                .venueId(venueId)
                .venueName(venue.getName())
                .from(from)
                .to(to)
                .totalRevenue(totalRevenue != null ? totalRevenue : 0L)
                .totalBookings(totalBookings)
                .completedBookings(completed)
                .cancelledBookings(cancelled)
                .build();
    }
}
