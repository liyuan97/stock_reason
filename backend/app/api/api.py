from fastapi import APIRouter

from app.api.endpoints import events

api_router = APIRouter()
api_router.include_router(events.router, prefix="/events", tags=["events"])