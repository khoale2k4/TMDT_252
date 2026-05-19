package vn.sportscourt.courtmate.b2b.dto.response.PricingRule;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingRuleResponse {

    @JsonProperty("rule_id")
    private UUID ruleId;

    @JsonProperty("rule_name")
    private String ruleName;

    private Integer priority;

    @JsonProperty("is_active")
    private Boolean isActive;

    @JsonProperty("conditions_summary")
    private String conditionsSummary;

    @JsonProperty("adjustment_summary")
    private String adjustmentSummary;

    @JsonProperty("valid_from")
    private String validFrom;

    @JsonProperty("valid_to")
    private String validTo;
    public String buildConditionsSummary(LogicConfig conditions) {
        List<String> parts = new ArrayList<>();

        for (RuleItem rule : conditions.getRules()) {
            switch (rule.getField()) {
                case "day_of_week":
                    parts.add(formatDays((List<String>) rule.getValue()));
                    break;
                case "hour_of_day":
                    List<Integer> hours = (List<Integer>) rule.getValue();
                    parts.add(hours.get(0) + ":00–" + hours.get(1) + ":00");
                    break;
                case "occupancy_rate":
                    int rate = (int) (((Number) rule.getValue()).doubleValue() * 100);
                    parts.add("Lấp đầy " + rule.getOperator() + " " + rate + "%");
                    break;
            }
        }

        // Nối các phần lại bằng dấu cách hoặc dấu chấm giữa (·)
        return String.join(" · ", parts);
    }

    // Hàm hỗ trợ format ngày trong tuần
    public String formatDays(List<String> days) {
        String rs="";
        if(days.contains("monday")) rs+="Thứ 2 ";
        if(days.contains("tuesday")) rs+="Thứ 3 ";
        if(days.contains("wednesday")) rs+="Thứ 4 ";
        if(days.contains("thursday")) rs+="Thứ 5 ";
        if(days.contains("friday")) rs+="Thứ 6 ";
        if (days.contains("saturday")) rs+="Thứ 7 ";
        if(days.contains("sunday")) rs+="Chủ nhật";

        // Bạn có thể thêm logic format cho các ngày khác ở đây
        return rs;
    }
    public String formatAdjustment(Map<String, Object> adjMap) {
        String type = (String) adjMap.getOrDefault("type", "");
        Number valueNum = (Number) adjMap.getOrDefault("value", 0);
        Number capNum = (Number) adjMap.get("cap_price");
        Number floorNum = (Number) adjMap.get("floor_price");

        StringBuilder sb = new StringBuilder();
        if(valueNum.longValue()<0){
        // 1. Xử lý phần hiển thị giá trị giảm chính
        if ("percentage".equalsIgnoreCase(type)) {
            sb.append("Giảm ").append(valueNum.intValue()).append("%");
        } else if ("fixed_amount".equalsIgnoreCase(type)) {
            sb.append("Giảm cố định").append(String.format("%,d", valueNum.longValue())).append("đ");
        } } else {if ("percentage".equalsIgnoreCase(type)) {
            sb.append("Tăng ").append(valueNum.intValue()).append("%");
        } else if ("fixed_amount".equalsIgnoreCase(type)) {
            sb.append("Tăng cố định").append(String.format("%,d", valueNum.longValue())).append("đ");
        } }

        // 2. Thêm thông tin chặn trên (Cap) và chặn dưới (Floor) nếu có
        List<String> constraints = new ArrayList<>();

        if (capNum != null && capNum.longValue() > 0) {
            constraints.add("Tối đa " + String.format("%,d", capNum.longValue()) + "đ");
        }
        if (floorNum != null && floorNum.longValue() > 0) {
            constraints.add("Tối thiểu " + String.format("%,d", floorNum.longValue()) + "đ");
        }

        if (!constraints.isEmpty()) {
            sb.append(" (").append(String.join(", ", constraints)).append(")");
        }

        return sb.toString();
    }
}



