from fastapi import APIRouter

from app.api.v1.endpoints import auth, learning, progress, satellites, tracking

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(satellites.router, prefix="/satellites", tags=["satellites"])
api_router.include_router(tracking.router, prefix="/tracking", tags=["tracking"])
api_router.include_router(learning.router, prefix="/courses", tags=["learning"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
