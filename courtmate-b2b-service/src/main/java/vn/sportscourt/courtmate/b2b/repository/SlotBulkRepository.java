package vn.sportscourt.courtmate.b2b.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.sportscourt.courtmate.b2b.entity.Slot;
import vn.sportscourt.courtmate.b2b.enums.SlotStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SlotBulkRepository extends JpaRepository<Slot, UUID> {

    /**
     * Check which (court, date, startTime) combos already exist.
     * Used by bulk-generate to detect duplicates.
     */
    @Query("""
        SELECT s FROM Slot s
        WHERE s.court.id = :courtId
          AND s.date BETWEEN :dateFrom AND :dateTo
        """)
    List<Slot> findByCourtAndDateRange(
            @Param("courtId") UUID courtId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo
    );

    /**
     * Bulk update price — skips booked slots.
     */
    @Modifying
    @Query("""
        UPDATE Slot s SET s.price = :newPrice, s.version = s.version + 1
        WHERE s.court.id = :courtId
          AND s.date BETWEEN :dateFrom AND :dateTo
          AND (CAST(:timeFrom AS LocalTime) IS NULL OR s.startTime >= :timeFrom)
          AND (CAST(:timeTo AS LocalTime) IS NULL OR s.endTime <= :timeTo)
          AND s.status != 'booked'
          AND FUNCTION('date_part', 'isodow', s.date) IN :daysOfWeek
        """)
    int bulkUpdatePrice(
            @Param("courtId") UUID courtId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("timeFrom") LocalTime timeFrom,
            @Param("timeTo") LocalTime timeTo,
            @Param("newPrice") int newPrice,
            @Param("daysOfWeek") List<Integer> daysOfWeek
    );

    /**
     * Bulk update status — skips booked slots automatically.
     */
    @Modifying
    @Query("""
        UPDATE Slot s SET s.status = :newStatus, s.version = s.version + 1
        WHERE s.court.id = :courtId
          AND s.date BETWEEN :dateFrom AND :dateTo
          AND (CAST(:timeFrom AS LocalTime) IS NULL OR s.startTime >= :timeFrom)
          AND (CAST(:timeTo AS LocalTime) IS NULL OR s.endTime <= :timeTo)
          AND s.status != 'booked'
        """)
    int bulkUpdateStatus(
            @Param("courtId") UUID courtId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("timeFrom") LocalTime timeFrom,
            @Param("timeTo") LocalTime timeTo,
            @Param("newStatus") SlotStatus newStatus
    );

    /** Count booked slots in range (for skipped_booked_count in response) */
    @Query("""
        SELECT COUNT(s) FROM Slot s
        WHERE s.court.id = :courtId
          AND s.date BETWEEN :dateFrom AND :dateTo
          AND (CAST(:timeFrom AS LocalTime) IS NULL OR s.startTime >= :timeFrom)
          AND (CAST(:timeTo AS LocalTime) IS NULL OR s.endTime <= :timeTo)
          AND s.status = 'booked'
        """)
    long countBookedInRange(
            @Param("courtId") UUID courtId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("timeFrom") LocalTime timeFrom,
            @Param("timeTo") LocalTime timeTo
    );

    /** List slots for a court with optional status filter and pagination */
    @Query("""
        SELECT s FROM Slot s
        WHERE s.court.id = :courtId
          AND s.date BETWEEN :dateFrom AND :dateTo
          AND (:hasStatus = false OR s.status = :status)
        """)
    Page<Slot> findByCourtFiltered(
            @Param("courtId") UUID courtId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("hasStatus") boolean hasStatus,
            @Param("status") SlotStatus status,
            org.springframework.data.domain.Pageable pageable
    );

    @Query("""
        SELECT s.id FROM Slot s
        WHERE s.court.id = :courtId
          AND s.date BETWEEN :dateFrom AND :dateTo
          AND (CAST(:timeFrom AS LocalTime) IS NULL OR s.startTime >= :timeFrom)
          AND (CAST(:timeTo AS LocalTime) IS NULL OR s.endTime <= :timeTo)
          AND s.status != 'booked'
        """)
    List<UUID> findIdsForStatusUpdate(
            @Param("courtId") UUID courtId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("timeFrom") LocalTime timeFrom,
            @Param("timeTo") LocalTime timeTo
    );

    @Modifying
    @Query("""
        UPDATE Slot s SET s.status = :newStatus, s.version = s.version + 1
        WHERE s.id IN :ids
        """)
    int bulkUpdateStatusByIds(
            @Param("ids") List<UUID> ids,
            @Param("newStatus") SlotStatus newStatus
    );
}
