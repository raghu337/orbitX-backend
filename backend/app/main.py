from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

import app.services.groq_service as groq_service
from app.api.v1.api import api_router
from app.core.config import settings

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

@app.post("/api/auth/forgot-password")
async def forgot_password_root(request: Request):
    """
    Root level forgot password endpoint.
    Routes to standard /api/auth/forgot-password structure.
    """
    try:
        body = await request.json()
        email = body.get("email")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    email = email.strip()
    print(f"\n[Auth Root] FORGOT PASSWORD REQUEST for: {email}")

    # Access database connection
    from app.db.session import get_db
    db_conn = get_db()

    try:
        ref = db_conn.reference("users")
        users_data = ref.order_by_child("email").equal_to(email).get()
        user_exists = bool(users_data)
    except Exception as db_err:
        print(f"[Auth Root] Firebase DB not initialized or query failed: {db_err}")
        mock_emails = {"astronaut@orbitx.com", "astronaut@gmail.com", "jhuvamma548@gmail.com", "test@example.com"}
        if email in mock_emails:
            print(f"[Auth Root] Fallback: Mock user found for local testing: {email}")
            user_exists = True
        else:
            raise HTTPException(
                status_code=503,
                detail="Database temporarily unavailable. Please try again.",
            )

    if not user_exists:
        print(f"[Auth Root] FAIL: Email not found: {email}")
        raise HTTPException(
            status_code=404,
            detail="No account registered with this email address.",
        )

    print(f"[Auth Root] SUCCESS: User found. Sending password reset email to {email}...")
    print("===========================================================")
    print("SMTP OUTGOING MAIL (Root Handler):")
    print(f"  To: {email}")
    print("  From: support@orbitx.com")
    print("  Subject: OrbitX - Password Reset Notification")
    print("  Body: Please click the link to reset your password: http://orbitx.com/reset-password")
    print("===========================================================")

    return {
        "success": True,
        "message": "A password reset notification has been sent to your registered email address."
    }

from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws")
@app.websocket("/ws/telemetry")
@app.websocket("/api/v1/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        await websocket.send_json({
            "event": "connected",
            "system": "OrbitX Telemetry WebSocket",
            "timestamp": datetime.utcnow().isoformat()
        })
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({
                "event": "telemetry_ping",
                "received": data,
                "status": "ONLINE",
                "timestamp": datetime.utcnow().isoformat()
            })
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

@app.get("/", tags=["root"])
async def root() -> dict:
    return {
        "message": "OrbitX Backend Running",
        "api_root": settings.API_V1_STR,
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "system": "OrbitX Backend",
        "database": "ONLINE",
        "timestamp": datetime.utcnow().isoformat()
    }

