package vn.sportscourt.courtmate.b2b.entity;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import vn.sportscourt.courtmate.b2b.enums.CourtStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "courts",
        uniqueConstraints = @UniqueConstraint(name = "uq_court_name_per_venue",
                columnNames = {"venue_id", "court_name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Court {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    Venue venue;

    @Column(name = "name", nullable = false, length = 100)
    String name;

    @Column(name = "sport_type", nullable = false, length = 50)
    String sportType;

    String description;

    @Builder.Default
    @Column(name = "base_price")
    Integer basePrice = 0;

    @Column(name = "surface_type", length = 50)
    String surfaceType;    // pvc | concrete | wood

    @Builder.Default
    @Column(name = "has_lighting")
    Boolean hasLighting = false;

    @Builder.Default
    @Column(name = "has_roof")
    Boolean hasRoof = false;

    @Builder.Default
    @Column(name = "max_players")
    Integer maxPlayers = 4;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    List<String> images;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status")
    CourtStatus status = CourtStatus.available;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "court", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Slot> slots;
}