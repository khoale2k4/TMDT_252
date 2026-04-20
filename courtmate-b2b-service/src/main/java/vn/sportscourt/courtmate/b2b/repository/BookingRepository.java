package vn.sportscourt.courtmate.b2b.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.sportscourt.courtmate.b2b.entity.Booking;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;
import vn.sportscourt.courtmate.b2b.enums.PaymentStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByVenueIdAndStatus(UUID venueId, BookingStatus status);

    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.items i
        JOIN FETCH i.slot s
        WHERE b.venue.id = :venueId
          AND s.date BETWEEN :from AND :to
        ORDER BY s.date, s.startTime
        """)
    List<Booking> findByVenueAndDateRange(
            @Param("venueId") UUID venueId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /**
     * Revenue report: sum final_amount for completed bookings in a date range.
     * Uses enum param — JPQL does NOT accept string literals for enum fields.
     */
    @Query("""
        SELECT COALESCE(SUM(b.finalAmount), 0)
        FROM Booking b
        JOIN b.items i
        JOIN i.slot s
        WHERE b.venue.id = :venueId
          AND b.status = :completedStatus
          AND s.date BETWEEN :from AND :to
        """)
    Long sumRevenueByVenueAndDateRange(
            @Param("venueId") UUID venueId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("completedStatus") BookingStatus completedStatus
    );

    /**
     * Count upcoming bookings that would be affected if a venue closes.
     * Uses a List<BookingStatus> param — IN clause with enums must use typed params.
     */
    @Query("""
        SELECT COUNT(DISTINCT b) FROM Booking b
        JOIN b.items i
        JOIN i.slot s
        WHERE b.venue.id = :venueId
          AND s.date >= CURRENT_DATE
          AND b.status IN :activeStatuses
        """)
    long countUpcomingByVenue(
            @Param("venueId") UUID venueId,
            @Param("activeStatuses") List<BookingStatus> activeStatuses
    );

    @Query("""
        SELECT DISTINCT b FROM Booking b
        LEFT JOIN b.user u
        LEFT JOIN b.items i
        LEFT JOIN i.slot s
        LEFT JOIN s.court c
        LEFT JOIN b.payments p
        WHERE b.venue.id = :venueId
          AND (CAST(:dateFrom AS date) IS NULL OR s.date >= :dateFrom)
          AND (CAST(:dateTo AS date) IS NULL OR s.date <= :dateTo)
          AND (:hasStatus = false OR b.status = :status)
          AND (:hasPaymentStatus = false OR p.status = :paymentStatus)
          AND (:hasSportType = false OR c.sportType = :sportType)
          AND (:hasCourtId = false OR c.id = :courtId)
          AND (:hasSearch = false OR
               LOWER(u.fullName) LIKE :searchKeyword OR
               u.phone LIKE :searchKeyword OR
               CAST(b.id AS string) LIKE :searchKeyword)
        """)
    Page<Booking> findFilteredBookings(
            @Param("venueId") UUID venueId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("hasStatus") boolean hasStatus, @Param("status") BookingStatus status,
            @Param("hasPaymentStatus") boolean hasPaymentStatus, @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("hasSportType") boolean hasSportType, @Param("sportType") String sportType,
            @Param("hasCourtId") boolean hasCourtId, @Param("courtId") UUID courtId,
            @Param("hasSearch") boolean hasSearch, @Param("searchKeyword") String searchKeyword,
            Pageable pageable
    );

    @Query("""
        SELECT b.status, COUNT(DISTINCT b.id), SUM(b.finalAmount)
        FROM Booking b
        LEFT JOIN b.user u
        LEFT JOIN b.items i
        LEFT JOIN i.slot s
        LEFT JOIN s.court c
        LEFT JOIN b.payments p
        WHERE b.venue.id = :venueId
          AND (CAST(:dateFrom AS date) IS NULL OR s.date >= :dateFrom)
          AND (CAST(:dateTo AS date) IS NULL OR s.date <= :dateTo)
          AND (:hasStatus = false OR b.status = :status)
          AND (:hasPaymentStatus = false OR p.status = :paymentStatus)
          AND (:hasSportType = false OR c.sportType = :sportType)
          AND (:hasCourtId = false OR c.id = :courtId)
          AND (:hasSearch = false OR
               LOWER(u.fullName) LIKE :searchKeyword OR
               u.phone LIKE :searchKeyword OR
               CAST(b.id AS string) LIKE :searchKeyword)
        GROUP BY b.status
        """)
    List<Object[]> getBookingSummary(
            @Param("venueId") UUID venueId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("hasStatus") boolean hasStatus, @Param("status") BookingStatus status,
            @Param("hasPaymentStatus") boolean hasPaymentStatus, @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("hasSportType") boolean hasSportType, @Param("sportType") String sportType,
            @Param("hasCourtId") boolean hasCourtId, @Param("courtId") UUID courtId,
            @Param("hasSearch") boolean hasSearch, @Param("searchKeyword") String searchKeyword
    );

    @Query("""
        SELECT b FROM Booking b
        LEFT JOIN FETCH b.user
        LEFT JOIN FETCH b.venue
        LEFT JOIN FETCH b.items i
        LEFT JOIN FETCH i.slot s
        LEFT JOIN FETCH s.court
        WHERE b.id = :id
        """)
    Optional<Booking> findBookingDetailById(@Param("id") UUID id);

    long countByUserId(UUID userId);

    @Query("""
        SELECT COUNT(DISTINCT b.id)
        FROM Booking b
        JOIN b.items i
        JOIN i.slot s
        WHERE b.venue.id = :venueId
          AND s.date BETWEEN :from AND :to
          AND (:hasStatus = false OR b.status = :status)
        """)
    long countBookingsByVenueAndDateRange(
            @Param("venueId") UUID venueId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("hasStatus") boolean hasStatus,
            @Param("status") BookingStatus status
    );
}
