package vn.sportscourt.courtmate.b2b.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.sportscourt.courtmate.b2b.entity.Venue;
import vn.sportscourt.courtmate.b2b.enums.VenueStatus;

import java.util.List;
import java.util.UUID;

@Repository
public interface VenueRepository extends JpaRepository<Venue, UUID> {
    List<Venue> findByOwnerIdAndStatus(UUID ownerId, VenueStatus status);
    List<Venue> findByOwnerId(UUID ownerId);
}
