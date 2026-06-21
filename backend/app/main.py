from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import check_db_connection
import app.services.groq_service as groq_service

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

@app.post("/api/search")
async def search_space(request: Request):
    try:
        # Extract the Raw Query Input
        try:
            body = await request.json()
            query = body.get("query") if isinstance(body, dict) else str(body)
            history = body.get("history", []) if isinstance(body, dict) else []
        except Exception:
            body_bytes = await request.body()
            query = body_bytes.decode("utf-8")
            history = []

        print(f"[BACKEND RECEIVED QUERY]: {query}")

        # Feed Query Directly to Groq Service
        system_prompt = "You are the OrbitX Space Assistant AI. Answer the user's space exploration or technical query thoroughly and cleanly."
        response_text = await groq_service.get_chat_response(
            query,
            history=history,
            system_prompt=system_prompt
        )

        # Match Front-End Response Schema
        return {
            "response": response_text,
            "results": [
                {
                    "title": "Space Assistant Answer",
                    "description": response_text
                }
            ]
        }
    except Exception as e:
        print(f"[BACKEND ERROR]: {str(e)}")
        return {"results": [{"title": "OrbitX System Status", "description": "Live telemetry search is processing. Server connection is active, but AI model returned empty content."}]}

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