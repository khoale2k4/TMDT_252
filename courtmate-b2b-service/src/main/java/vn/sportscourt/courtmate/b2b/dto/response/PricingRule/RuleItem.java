package vn.sportscourt.courtmate.b2b.dto.response.PricingRule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RuleItem {
    private String field;
    private Object value; // Dùng Object vì value có thể là List hoặc Number
    private String operator;
}
