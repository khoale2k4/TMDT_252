package vn.sportscourt.courtmate.b2b.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.sportscourt.courtmate.b2b.entity.Court;
import vn.sportscourt.courtmate.b2b.enums.CourtStatus;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourtRepository extends JpaRepository<Court, UUID> {

    List<Court> findByVenueId(UUID venueId);

    List<Court> findByVenueIdAndStatus(UUID venueId, CourtStatus status);

    boolean existsByVenueIdAndName(UUID venueId, String courtName);

    @Query("""
        SELECT COUNT(c) > 0 FROM Court c
        WHERE c.venue.id = :venueId
          AND c.name = :courtName
          AND c.id <> :excludeId
        """)
    boolean existsByVenueIdAndCourtNameAndIdNot(
            @Param("venueId")    UUID venueId,
            @Param("courtName")  String courtName,
            @Param("excludeId")  UUID excludeId
    );

    @Query("""
        SELECT COUNT(s) > 0 FROM Slot s
        WHERE s.court.id = :courtId
          AND s.status = 'booked'
        """)
    boolean hasBookedSlots(@Param("courtId") UUID courtId);

    @Query("""
        SELECT COUNT(s) FROM Slot s
        WHERE s.court.id = :courtId
          AND s.status = 'booked'
          AND s.date >= CURRENT_DATE
        """)
    long countUpcomingBookedSlots(@Param("courtId") UUID courtId);
}
