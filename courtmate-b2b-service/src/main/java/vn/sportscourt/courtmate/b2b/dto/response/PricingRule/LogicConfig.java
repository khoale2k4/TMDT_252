package vn.sportscourt.courtmate.b2b.dto.response.PricingRule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogicConfig {
    private List<RuleItem> rules;
    private String operator; // AND, OR
}