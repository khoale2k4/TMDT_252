from fastapi import APIRouter
from app.schemas.pricing import PricingRequest, PricingResponse
from app.services import pricing_service

router = APIRouter()

@router.post("/calculate", response_model=PricingResponse)
async def calculate_pricing(request: PricingRequest):
    results = await pricing_service.calculate_dynamic_prices(request)
    return PricingResponse(
        results=results,
        message="Dynamic pricing calculated successfully based on occupancy rate."
    )
