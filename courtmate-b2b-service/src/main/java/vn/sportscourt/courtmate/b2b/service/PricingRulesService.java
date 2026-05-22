package vn.sportscourt.courtmate.b2b.service;

import vn.sportscourt.courtmate.b2b.dto.response.NewRuleResponse;
import vn.sportscourt.courtmate.b2b.dto.response.PricingRule.PricingRuleResponse;
import vn.sportscourt.courtmate.b2b.dto.response.UpdatePriceSlotResponse;
import vn.sportscourt.courtmate.b2b.entity.PricingRules;

import java.util.List;
import java.util.Map;

public interface PricingRulesService {
    List<PricingRuleResponse> getAllPricingRules();
    Map.Entry<Double,String> calculateFinalPrice(String venueId, double basePrice, double currentOccupancy, String dayOfWeek, int hourOfDay);
    boolean isRuleMatch(PricingRules rule, String day, int hour, double occupancy);
    double applyAdjustment(double basePrice, Map<String, Object> adj);
    NewRuleResponse createRule(PricingRules rule);
    List<PricingRules>validPricingRules();
    void updatePricingRules();
    List<UpdatePriceSlotResponse> updatePricing();
    
}
