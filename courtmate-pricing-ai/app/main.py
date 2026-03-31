from fastapi import FastAPI
from app.api.routers import pricing

app = FastAPI(title="CourtMate Dynamic Pricing AI Service")

@app.get("/")
async def root():
    return {"message": "Welcome to CourtMate Dynamic Pricing AI Service"}

app.include_router(pricing.router, prefix="/internal/pricing", tags=["pricing"])
