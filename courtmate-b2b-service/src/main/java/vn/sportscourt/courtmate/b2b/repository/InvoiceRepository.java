package vn.sportscourt.courtmate.b2b.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.sportscourt.courtmate.b2b.entity.Invoice;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByBooking_Id(UUID bookingId);

    @Override
    boolean existsById(UUID uuid);

    @Query("""
        SELECT i FROM Invoice i
        JOIN FETCH i.booking b
        LEFT JOIN FETCH b.user u
        WHERE (CAST(:dateFrom AS date) IS NULL OR CAST(i.issuedAt AS date) >= :dateFrom)
          AND (CAST(:dateTo AS date) IS NULL OR CAST(i.issuedAt AS date) <= :dateTo)
          AND (:hasStatus = false OR i.status = :status)
          AND (:hasSearch = false OR
               LOWER(i.misaInvoiceNo) LIKE :searchKeyword OR
               CAST(b.id AS string) LIKE :searchKeyword OR
               LOWER(u.fullName) LIKE :searchKeyword)
        """)
    Page<Invoice> findFilteredInvoices(
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("hasStatus") boolean hasStatus, @Param("status") String status,
            @Param("hasSearch") boolean hasSearch, @Param("searchKeyword") String searchKeyword,
            Pageable pageable
    );
}