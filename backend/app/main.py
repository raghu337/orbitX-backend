import sys
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.api import api_router
from app.core.config import settings

# Force stdout to UTF-8 on Windows to prevent UnicodeEncodeError in middleware
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="OrbitX Backend API",
    version="2.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    method = request.method
    path = request.url.path
    try:
        print(f"[API] >> {method} {path}")
    except Exception:
        pass
    try:
        response = await call_next(request)
        elapsed = round((time.time() - start) * 1000)
        try:
            print(f"[API] OK {method} {path} -> {response.status_code} ({elapsed}ms)")
        except Exception:
            pass
        return response
    except Exception as e:
        elapsed = round((time.time() - start) * 1000)
        try:
            print(f"[API] ERROR {method} {path} -> UNHANDLED after {elapsed}ms: {e}")
        except Exception:
            pass
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "path": path},
        )


# Root routes
@app.get("/")
def root():
    return {
        "message": "Welcome to OrbitX API",
        "docs": "/docs",
        "health": "/health",
        "version": "2.0.0",
    }


@app.get("/health")
def health_check():
    """Full health check — verifies backend is alive and DB is reachable."""
    from app.db.session import check_db_connection
    db_ok = check_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
        "api": "running",
    }


@app.get("/ping")
def ping():
    """Minimal liveness ping — no DB involved."""
    return {"status": "ok"}


# API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)
