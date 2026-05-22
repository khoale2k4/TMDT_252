package vn.sportscourt.courtmate.b2b.dto.response;
import java.time.OffsetDateTime;
import java.util.UUID;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NewRuleResponse {
private UUID rule_id;
private String rule_name;
private String status;
private OffsetDateTime created_at;


}
