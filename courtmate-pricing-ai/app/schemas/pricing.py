from pydantic import BaseModel
from typing import List

class PricingRequest(BaseModel):
    slot_ids: List[str]
    occupancy_rate: float

class PricingResult(BaseModel):
    slot_id: str
    old_price: float
    new_price: float
    applied_multiplier: float

class PricingResponse(BaseModel):
    results: List[PricingResult]
    message: str
