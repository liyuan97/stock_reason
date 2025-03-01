from fastapi import APIRouter

from app.api.endpoints import events, stocks

api_router = APIRouter()
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(stocks.router, prefix="/stocks", tags=["stocks"]) 