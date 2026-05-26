package vn.sportscourt.courtmate.b2b.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;
import java.util.List;

@Data
@Table(name = "matchmaking_lobbies")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class MatchmakingLobby {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id") // Optional until matched
    private Slot slot;

    @Column(name = "status")
    private String status = "WAITING"; // WAITING, MATCHED, CANCELLED

    @Column(name = "required_players", columnDefinition = "int default 4")
    private Integer requiredPlayers = 4;

    @Column(name = "current_players", columnDefinition = "int default 1")
    private Integer currentPlayers = 1;

    @Column(name = "min_elo")
    private Integer minElo;

    @Column(name = "max_elo")
    private Integer maxElo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @OneToMany(mappedBy = "lobby", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MatchmakingPlayer> players;
}
