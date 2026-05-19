package vn.sportscourt.courtmate.b2b.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.sportscourt.courtmate.b2b.entity.PricingRules;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PricingRulesRepository extends JpaRepository<PricingRules, UUID> {
    @Query(value = "SELECT * FROM pricing_rules " +
            "WHERE venue_id = CAST(:venueId AS uuid) " +
            "AND is_active = true " +
            "AND :date >= valid_from AND :date <= valid_to " +
            "ORDER BY priority ASC, created_at DESC ",
            nativeQuery = true)
    List<PricingRules> findAllActiveRules(
            @Param("venueId") String venueId,
            @Param("date") LocalDate date
    );
    @Query(value = "SELECT * FROM pricing_rules " +
            "WHERE is_active = true " +
            "ORDER BY priority DESC",
            nativeQuery = true)
    List<PricingRules> getActiveRules(
    );


}

