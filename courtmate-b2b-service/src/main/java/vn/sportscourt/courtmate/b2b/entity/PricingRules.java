package vn.sportscourt.courtmate.b2b.entity;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import vn.sportscourt.courtmate.b2b.dto.response.PricingRule.LogicConfig;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "pricing_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingRules {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "venue_id", nullable = false)
    private UUID venue_id;

    @Column(name = "rule_name", nullable = false)
    private String rule_name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer priority = 0;

    @Column(name = "is_active")
    private Boolean is_active = true;

    /**
     * Sử dụng Map để chứa dữ liệu JSONB
     * Bạn cũng có thể tạo một Class POJO riêng để map cấu trúc cụ thể của conditions
     */
    @Type(JsonBinaryType.class)
    @Column(name = "conditions", columnDefinition = "jsonb", nullable = false)
    private LogicConfig conditions;

    @Type(JsonBinaryType.class)
    @Column(name = "adjustments", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> adjustments;

    @Column(name = "valid_from")
    private LocalDate valid_from;

    @Column(name = "valid_to")
    private LocalDate valid_to;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime created_at;

    @PrePersist
    protected void onCreate() {
        this.created_at = OffsetDateTime.now();
        if (this.priority == null) this.priority = 0;
        if (this.is_active == null) this.is_active = true;
    }
}
