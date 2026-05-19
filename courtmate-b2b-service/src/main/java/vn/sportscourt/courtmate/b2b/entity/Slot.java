package vn.sportscourt.courtmate.b2b.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.sportscourt.courtmate.b2b.enums.SlotStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "slots",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_slot",
                columnNames = {"court_id", "date", "start_time"}
        )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false)
    Court court;

    @Column(nullable = false)
    LocalDate date;

    @Column(name = "start_time", nullable = false)
    LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalTime endTime;

    /**
     * Price in VNĐ (no decimals needed per schema)
     */
    @Column(nullable = false)
    Integer price;

    @Column(name = "dynamic_price")
    Integer dynamicPrice;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status")
    SlotStatus status = SlotStatus.available;

    /**
     * Optimistic locking version for concurrency control.
     * Prevents double-booking race conditions.
     */
    @Builder.Default
    @Version
    Integer version = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locked_by")
    Users lockedBy;

    @Column(name = "locked_until")
    OffsetDateTime lockedUntil;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    OffsetDateTime createdAt;
}