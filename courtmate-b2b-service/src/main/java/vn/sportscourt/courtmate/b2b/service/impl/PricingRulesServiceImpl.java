package vn.sportscourt.courtmate.b2b.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.sportscourt.courtmate.b2b.dto.response.NewRuleResponse;
import vn.sportscourt.courtmate.b2b.dto.response.PricingRule.LogicConfig;
import vn.sportscourt.courtmate.b2b.dto.response.PricingRule.PricingRuleResponse;
import vn.sportscourt.courtmate.b2b.dto.response.PricingRule.RuleItem;
import vn.sportscourt.courtmate.b2b.dto.response.UpdatePriceSlotResponse;
import vn.sportscourt.courtmate.b2b.entity.PricingRules;
import vn.sportscourt.courtmate.b2b.entity.Slot;
import vn.sportscourt.courtmate.b2b.repository.PricingRulesRepository;
import vn.sportscourt.courtmate.b2b.repository.SlotRepository;
import vn.sportscourt.courtmate.b2b.service.PricingRulesService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PricingRulesServiceImpl implements PricingRulesService {
    private final PricingRulesRepository pricingRulesRepository;
    private final SlotRepository slotRepository;
    @Override
    public List<PricingRuleResponse> getAllPricingRules(){
        List<PricingRuleResponse> res= new ArrayList<>();
        List<PricingRules> all =pricingRulesRepository.findAll();
        for(PricingRules a:all){
            PricingRuleResponse item = new PricingRuleResponse();

            // 2. Map các thông tin cơ bản
            item.setRuleId(a.getId());
            item.setRuleName(a.getRule_name());
            item.setPriority(a.getPriority());
            item.setIsActive(a.getIs_active());

            // 3. Xử lý logic build chuỗi summary từ Object LogicConfig
            // Giả sử a.getConditions() trả về kiểu LogicConfig như đã sửa ở bước trước
            String conditionSummary = item.buildConditionsSummary(a.getConditions());
            item.setConditionsSummary(conditionSummary);

            // 4. Map các thông tin về hiệu chỉnh (Adjustment)
            // Ví dụ: "+40% (tối đa 300.000đ)" - Bạn có thể viết thêm hàm buildAdjustmentSummary tương tự
            item.setAdjustmentSummary(item.formatAdjustment(a.getAdjustments()));

            // 5. Map ngày tháng
            item.setValidFrom(a.getValid_from().toString());
            item.setValidTo(a.getValid_to().toString());

            // 6. Thêm vào list kết quả
            res.add(item);}
        return res;
    }
    public Map.Entry<Double, String> calculateFinalPrice(String venueId, double basePrice, double currentOccupancy, String dayOfWeek, int hourOfDay) {
        LocalDateTime now = LocalDateTime.now();
//        String dayOfWeek = now.getDayOfWeek().name().toLowerCase();
//        int hourOfDay = now.getHour();

        // 1. Lấy tất cả rules đang hoạt động, sắp xếp theo priority giảm dần
        List<PricingRules> activeRules = pricingRulesRepository.findAllActiveRules(venueId, now.toLocalDate());

        for (PricingRules rule : activeRules) {
            if (isRuleMatch(rule, dayOfWeek, hourOfDay, currentOccupancy)) {
                double a = applyAdjustment(basePrice, rule.getAdjustments());


                return Map.entry(a, rule.getRule_name());
            }
        }
        return Map.entry(basePrice, "No rule matched");
         // Không khớp rule nào thì trả về giá gốc
    }


    /**
     * Kiểm tra xem các điều kiện (conditions) có khớp với thực tế không
     */
    public boolean isRuleMatch(PricingRules rule, String day, int hour, double occupancy) {
        LogicConfig conditions = rule.getConditions();

        //List<Map<String, Object>> rules = (List<Map<String, Object>>) conditions.getRules();
        List<RuleItem> rules = conditions.getRules();
        String operator = (String) conditions.getOperator();

        boolean finalResult = operator.equals("AND");

        for (RuleItem condition : rules) {
            String field = (String) condition.getField();
            String op = (String) condition.getOperator();
            Object value = condition.getValue();

            boolean currentMatch = false;
            switch (field) {
                case "day_of_week":
                    currentMatch = ((List<String>) value).contains(day);
                    System.out.println(value);
                    break;
                case "hour_of_day":
                    List<Integer> range = (List<Integer>) value;
                    currentMatch = (hour >= range.get(0) && hour <= range.get(1));
                    System.out.println(value);
                    break;
                case "occupancy_rate":
                    currentMatch = occupancy >= Double.parseDouble(value.toString());
                    System.out.println(value);
                    break;
            }

            if (operator.equals("AND")) finalResult &= currentMatch;
            else finalResult |= currentMatch;
        }
        return finalResult;
//        return false;
    }
    

    /**
     * Tính toán giá sau khi cộng thêm/trừ đi adjustment và áp dụng Cap/Floor
     */
    public double applyAdjustment(double basePrice, Map<String, Object> adj) {
        String type = (String) adj.get("type");
        double val = Double.parseDouble(adj.get("value").toString());
        double cap = Double.parseDouble(adj.get("cap_price").toString());
        double floor = Double.parseDouble(adj.get("floor_price").toString());

        double newPrice = basePrice;
        if ("percentage".equals(type)) {
            newPrice = basePrice * (1 + (val / 100));
        } else if ("fixed_amount".equals(type)) {
            newPrice = basePrice + val;
        }

        // Áp dụng giới hạn trần và sàn
        return Math.min(Math.max(newPrice, floor), cap);
    }
    public NewRuleResponse createRule(PricingRules rule){
//         rule.setId("pr_" + UUID.randomUUID().toString().substring(0, 8));

        // 2. Đảm bảo các trường thời gian được gán
        if (rule.getCreated_at() == null) {
            rule.setCreated_at(OffsetDateTime.now());
        }

        // 3. Lưu đối tượng đã có dữ liệu từ RequestBody vào DB
        pricingRulesRepository.save(rule);
    return NewRuleResponse.builder()
            .rule_id(rule.getId())
            .rule_name(rule.getRule_name())
            .status(rule.getIs_active()?"active":"inactive")
            .created_at(rule.getCreated_at()).build();};

    public List<PricingRules>validPricingRules(){
        List<PricingRules> activeRule= pricingRulesRepository.getActiveRules();
        return activeRule;
    }
    public void updatePricingRules(){
        List<PricingRules> allrule= pricingRulesRepository.findAll();
        System.out.println(LocalDate.now());
        for(PricingRules i: allrule){
            if(!i.getValid_from().isAfter(LocalDate.now()) && !i.getValid_to().isBefore(LocalDate.now())) {i.setIs_active(true);}
            else i.setIs_active(false);
            pricingRulesRepository.save(i);
        }


        };
    public List<UpdatePriceSlotResponse> updatePricing(){
        List<Slot> slots = slotRepository.findAllActiveRules(LocalDate.now(), LocalTime.now());
        for (Slot a: slots){
            double tm = calculateFinalPrice(a.getCourt().getVenue().getId().toString(),a.getPrice(),
                    0.9,a.getDate().getDayOfWeek().name().toLowerCase(),a.getStartTime().getHour()).getKey();
            a.setDynamicPrice((int)tm);
            a.setVersion(a.getVersion()+1);

            slotRepository.save(a);
        }
        return toResponseList(slots);
        //return null;
    };
    public UpdatePriceSlotResponse toResponse(Slot slot, String a) {
        if (slot == null) {
            return null;
        }

        // Sử dụng Builder sinh ra bởi Lombok từ class SlotResponse của bạn
        return UpdatePriceSlotResponse.builder()
                .id(slot.getId())
                .date(slot.getDate()) // Hoặc slot.getValidFrom() tùy thuộc cách bạn lưu ngày
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(slot.getStatus())
                .rulename(a)
                // Ép kiểu nếu trường trong Entity là Double/Long sang Integer của Response
                .price(slot.getPrice() != null ? slot.getPrice().intValue() : null)
                // Trường dynamicPrice có thể được tính toán thông qua hàm áp dụng Rule trước đó của bạn
                .dynamicPrice(slot.getDynamicPrice() != null ? slot.getDynamicPrice().intValue() : null)
                .version(slot.getVersion())
                .build();
    }
    public List<UpdatePriceSlotResponse> toResponseList(List<Slot> slots) {
        if (slots == null || slots.isEmpty()) {
            return Collections.emptyList();
        }

        return slots.stream()
                .map(slot -> {
                    // 1. Tính toán hoặc tìm tên Rule tương ứng với Slot này ở đây
                    String ruleName = calculateFinalPrice(slot.getCourt().getVenue().getId().toString(),slot.getPrice(),
                            0.9,slot.getDate().getDayOfWeek().name().toLowerCase(),slot.getStartTime().getHour()).getValue();

                    // 2. Truyền vào hàm builder
                    return this.toResponse(slot, ruleName);
                })
                .collect(Collectors.toList());
    }
}
