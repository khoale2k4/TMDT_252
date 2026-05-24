package vn.sportscourt.courtmate.b2b.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    Venue venue;

    @Column(name = "total_amount", nullable = false)
    Integer totalAmount;

    @Builder.Default
    @Column(name = "discount_amount")
    Integer discountAmount = 0;

    @Builder.Default
    @Column(name = "tax_amount")
    Integer taxAmount = 0;

    @Column(name = "final_amount", nullable = false)
    Integer finalAmount;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status")
    BookingStatus status = BookingStatus.pending_payment;

    String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    OffsetDateTime updatedAt;

    @Column(name = "recurring_group_id")
    UUID recurringGroupId;

    @Column(name = "recurring_frequency")
    String recurringFrequency; // "weekly", "monthly", "none"

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    List<BookingItem> items;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    List<Payment> payments;
}