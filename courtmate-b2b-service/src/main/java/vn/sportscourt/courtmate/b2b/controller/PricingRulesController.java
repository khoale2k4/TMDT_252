package vn.sportscourt.courtmate.b2b.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.sportscourt.courtmate.b2b.dto.response.NewRuleResponse;
import vn.sportscourt.courtmate.b2b.dto.response.PricingRule.PricingRuleResponse;
import vn.sportscourt.courtmate.b2b.dto.response.APIResponse;
import vn.sportscourt.courtmate.b2b.dto.response.UpdatePriceSlotResponse;
import vn.sportscourt.courtmate.b2b.entity.PricingRules;
import vn.sportscourt.courtmate.b2b.service.PricingRulesService;

import java.util.List;

@RestController
@RequestMapping("/admin/pricing-rules")
@RequiredArgsConstructor
public class PricingRulesController {

    private final PricingRulesService rulesService;
    @PostMapping("/new-rule")
    public ResponseEntity<APIResponse<NewRuleResponse>> createRule(
            @RequestHeader("Authorization") String token,
            @RequestBody PricingRules rule) {
        // 1. Logic kiểm tra Role (Mockup)
//        if (!token.contains("owner")) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//        }
        // 2. Lưu vào database
        NewRuleResponse savedRule = rulesService.createRule(rule);
        return new ResponseEntity<>(APIResponse.ok(savedRule), HttpStatus.CREATED);
    }

    
    @GetMapping("/test")
//    public ResponseEntity<Map<String,List<PricingRules>>> getAll(){
//        List<PricingRules> rule=repository.findAll();
//        return new ResponseEntity<>("ok",rule);
//    }
    public ResponseEntity<APIResponse<List<PricingRuleResponse>>> getAll() {
        List<PricingRuleResponse> rules = rulesService.getAllPricingRules();
        return ResponseEntity.ok(APIResponse.ok(rules)); // Trả về 200 OK kèm danh sách
    }


    @PutMapping("/refresh-active-rules")
    public ResponseEntity<List<PricingRules>> RefreshRule(
//            @RequestHeader("Authorization") String token,
            ) {
//
//        // 1. Logic kiểm tra Role (Mockup)
////        if (!token.contains("owner")) {
////            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
////        }
//
//        // 2. Lưu vào database
//        PricingRules savedRule = ser.save(rule);
//
//        // 3. Build response theo format yêu cầu
//        Map<String, Object> response = new HashMap<>();
//        Map<String, Object> data = new HashMap<>();
//
//        data.put("rule_id", savedRule.getId());
//        data.put("rule_name", savedRule.getRule_name());
//        data.put("status", savedRule.getIs_active() ? "active" : "inactive");
//        data.put("created_at", savedRule.getCreated_at());
//
//        response.put("data", data);

//        return new ResponseEntity<>(, HttpStatus.CREATED);
        rulesService.updatePricingRules();
        return  ResponseEntity.ok(rulesService.validPricingRules());



    }
    @GetMapping("/a")
    public ResponseEntity<APIResponse<List<UpdatePriceSlotResponse>>> a(){

        //return rulesService.calculateFinalPrice("10000000-0000-0000-0000-000000000001", 100000, 0.9,"monday",18);
        //return null;
        return ResponseEntity.ok(APIResponse.ok(rulesService.updatePricing()));
    }

}
