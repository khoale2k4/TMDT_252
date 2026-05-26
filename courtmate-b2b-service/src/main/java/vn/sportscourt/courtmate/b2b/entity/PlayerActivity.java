package vn.sportscourt.courtmate.b2b.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Table(name = "player_activities")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class PlayerActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(name = "matches_played", columnDefinition = "int default 0")
    private Integer matchesPlayed = 0;

    @Column(name = "elo_rating", columnDefinition = "int default 1200")
    private Integer eloRating = 1200;

    @Column(name = "level", columnDefinition = "int default 1")
    private Integer level = 1;

    @Column(name = "checkin_count", columnDefinition = "int default 0")
    private Integer checkinCount = 0;

    @Column(name = "last_checkin_date")
    private ZonedDateTime lastCheckinDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
