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
}
