package vn.sportscourt.courtmate.b2b.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.sportscourt.courtmate.b2b.entity.PricingRules;
import vn.sportscourt.courtmate.b2b.entity.RefreshToken;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByUser_id(UUID userid);
    Optional<RefreshToken> findByToken(String token);
}
