package vn.sportscourt.courtmate.b2b.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.sportscourt.courtmate.b2b.entity.Payment;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    @Query(value = "SELECT * FROM payments " +
            "WHERE booking_id = CAST(:bookingId AS uuid) " ,
            nativeQuery = true)
    Payment findByBooking_Id(UUID bookingId);
}