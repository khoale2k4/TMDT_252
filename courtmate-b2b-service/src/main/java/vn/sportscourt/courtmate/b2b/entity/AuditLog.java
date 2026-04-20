package vn.sportscourt.courtmate.b2b.entity;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "entity_name", nullable = false, length = 100)
    String entityName;

    @Column(name = "entity_id", nullable = false)
    UUID entityId;

    /** 'create' | 'update' | 'delete' | 'reschedule' | 'cancel' | 'check_in' */
    @Column(nullable = false, length = 50)
    String action;

    @Type(JsonBinaryType.class)
    @Column(name = "old_value", columnDefinition = "jsonb")
    Map<String, Object> oldValue;

    @Type(JsonBinaryType.class)
    @Column(name = "new_value", columnDefinition = "jsonb")
    Map<String, Object> newValue;

    String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    User performedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    OffsetDateTime createdAt;
}
