package vn.sportscourt.courtmate.b2b.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.sportscourt.courtmate.b2b.entity.UserVenue;
import vn.sportscourt.courtmate.b2b.entity.key.UserVenueKey;

import java.util.List;
import java.util.UUID;

public interface UserVenueRepository extends JpaRepository<UserVenue, UserVenueKey> {
    List<UserVenue> findByUserVenueKey_UserId(UUID userId);
}
