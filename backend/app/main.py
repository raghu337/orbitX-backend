from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import check_db_connection

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="OrbitX backend for real-time satellite tracking and N2YO integration.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["root"])
async def root() -> dict:
    return {
        "message": "OrbitX Backend Running",
        "api_root": settings.API_V1_STR,
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/health")
def health():
    return {"status": "ok"}