package vn.sportscourt.courtmate.b2b.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Table(name = "matchmaking_players")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class MatchmakingPlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lobby_id", nullable = false)
    private MatchmakingLobby lobby;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(name = "status")
    private String status = "JOINED"; // JOINED, READY, LEFT

    @Column(name = "is_host", columnDefinition = "boolean default false")
    private Boolean isHost = false;

    @Column(name = "paid_amount", columnDefinition = "bigint default 0")
    private Long paidAmount = 0L;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
