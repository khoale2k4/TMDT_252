from app.schemas.pricing import PricingRequest, PricingResult

async def calculate_dynamic_prices(request: PricingRequest):
    results = []
    multiplier = 1.0
    
    # Mock AI Logic: if occupancy > 70%, increase price by 20%
    if request.occupancy_rate > 70:
        multiplier = 1.2
        
    for slot_id in request.slot_ids:
        # In a real app, we would fetch the current price from DB or cache
        mock_old_price = 100000.0 
        new_price = mock_old_price * multiplier
        
        results.append(PricingResult(
            slot_id=slot_id,
            old_price=mock_old_price,
            new_price=new_price,
            applied_multiplier=multiplier
        ))
        
    return results
