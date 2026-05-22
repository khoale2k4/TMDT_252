package vn.sportscourt.courtmate.b2b.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.sportscourt.courtmate.b2b.entity.PricingRules;
import vn.sportscourt.courtmate.b2b.entity.Slot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface SlotRepository extends JpaRepository<Slot, UUID> {
    @Query(value = "SELECT * FROM slots a " +
            "WHERE( " +
            "    a.date > :date " +
            "    OR " +
            "    (a.date = :date AND start_time >= :time) " + // Điều kiện (B AND C): Là ngày hôm nay VÀ giờ phải lớn hơn hiện tại
            ") " +
            "ORDER BY a.date ASC, start_time DESC",
            nativeQuery = true)
    List<Slot> findAllActiveRules(

            @Param("date") LocalDate date,
            @Param("time") LocalTime time
    );

    @Query("""
        SELECT s FROM Slot s
        JOIN FETCH s.court c
        WHERE c.venue.id = :venueId
          AND s.date BETWEEN :from AND :to
        ORDER BY s.date, c.name, s.startTime
        """)
    List<Slot> findByVenueAndDateRange(
            @Param("venueId") UUID venueId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    List<Slot> findByCourtIdAndDate(UUID courtId, LocalDate date);

    @Query("""
        SELECT s FROM Slot s
        WHERE s.court.id = :courtId
          AND s.date = :date
          AND s.id <> :excludeId
          AND s.startTime < :endTime
          AND s.endTime > :startTime
        """)
    List<Slot> findOverlapping(
            @Param("courtId") UUID courtId,
            @Param("date") LocalDate date,
            @Param("startTime") java.time.LocalTime startTime,
            @Param("endTime") java.time.LocalTime endTime,
            @Param("excludeId") UUID excludeId
    );

    @Query("SELECT s FROM Slot s WHERE s.id = :id AND s.status = :status")
    Optional<Slot> findByIdAndStatus(@Param("id") UUID id, @Param("status") vn.sportscourt.courtmate.b2b.enums.SlotStatus status);

    @Query("""
        SELECT s FROM Slot s 
        JOIN FETCH s.court c 
        WHERE s.id = :id
        """)
    Optional<Slot> findSlotDetailById(@Param("id") UUID id);
}
