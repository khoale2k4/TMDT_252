package vn.sportscourt.courtmate.b2b.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    Booking booking;

    @Column(name = "misa_invoice_no", length = 100)
    String misaInvoiceNo;

    @Column(name = "pdf_url")
    String pdfUrl;

    @Builder.Default
    @Column(length = 50)
    String status = "issued";

    @CreationTimestamp
    @Column(name = "issued_at")
    OffsetDateTime issuedAt;
}
