import time
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.user import User, UserCreate
from app.schemas.token import Token
from app.models.user import User as UserModel
from app.core import deps
from app.core import security
from app.core.config import settings
from app.db.session import get_db

router = APIRouter()


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------
@router.post("/login", response_model=Token)
async def login_access_token(
    request: Request,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2-compatible login. Expects application/x-www-form-urlencoded.
    Returns a JWT bearer token on success.

    IMPORTANT: Uses async def + asyncio.to_thread for bcrypt so the event loop
    is never blocked — this was the root cause of the original login hang.
    """
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"
    print(f"\n{'='*55}")
    print(f"[Auth] LOGIN REQUEST")
    print(f"[Auth]   Email : {form_data.username}")
    print(f"[Auth]   IP    : {client_ip}")
    print(f"{'='*55}")

    # Step 1: DB user lookup
    print("[Auth] Step 1/4: Querying database...")
    try:
        user = db.query(UserModel).filter(
            UserModel.email == form_data.username
        ).first()
    except Exception as db_err:
        elapsed = round((time.time() - start_time) * 1000)
        print(f"[Auth] FAIL: DB query error after {elapsed}ms: {db_err}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database temporarily unavailable. Please try again.",
        )

    if not user:
        elapsed = round((time.time() - start_time) * 1000)
        print(f"[Auth] FAIL: User not found '{form_data.username}' [{elapsed}ms]")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print(f"[Auth] Step 1 OK: User found id={user.id} name='{user.name}'")

    # Step 2: Password verification (async — does NOT block the event loop)
    print("[Auth] Step 2/4: Verifying password via async bcrypt...")
    try:
        password_ok = await security.async_verify_password(
            form_data.password, user.password_hash
        )
    except Exception as bcrypt_err:
        elapsed = round((time.time() - start_time) * 1000)
        print(f"[Auth] FAIL: bcrypt exception after {elapsed}ms: {bcrypt_err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error. Please try again.",
        )

    if not password_ok:
        elapsed = round((time.time() - start_time) * 1000)
        print(f"[Auth] FAIL: Wrong password for id={user.id} [{elapsed}ms]")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print("[Auth] Step 2 OK: Password verified")

    # Step 3: Generate JWT
    print("[Auth] Step 3/4: Generating JWT token...")
    try:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token = security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    except Exception as jwt_err:
        elapsed = round((time.time() - start_time) * 1000)
        print(f"[Auth] FAIL: JWT generation error after {elapsed}ms: {jwt_err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token generation failed. Please try again.",
        )
    print(f"[Auth] Step 3 OK: Token generated (expires {settings.ACCESS_TOKEN_EXPIRE_MINUTES}min)")

    # Step 4: Return response
    elapsed = round((time.time() - start_time) * 1000)
    print(f"[Auth] Step 4 OK: LOGIN SUCCESS for '{form_data.username}' in {elapsed}ms")
    print(f"{'='*55}\n")

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# ---------------------------------------------------------------------------
# POST /auth/signup
# ---------------------------------------------------------------------------
@router.post("/signup", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """Register a new user account."""
    print(f"[Auth] SIGNUP REQUEST for: {user_in.email}")

    existing = db.query(UserModel).filter(
        UserModel.email == user_in.email
    ).first()
    if existing:
        print(f"[Auth] FAIL: Email already registered: {user_in.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    print("[Auth] Hashing password (async)...")
    try:
        hashed_pw = await security.async_hash_password(user_in.password)
    except Exception as e:
        print(f"[Auth] FAIL: Password hashing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not process password. Please try again.",
        )

    user = UserModel(
        email=user_in.email,
        password_hash=hashed_pw,
        name=user_in.name or "Space Explorer",
        role=user_in.role or "user",
    )
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        print(f"[Auth] FAIL: DB error during signup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create account. Please try again.",
        )

    print(f"[Auth] SIGNUP OK: id={user.id} email={user.email}")
    return user


# ---------------------------------------------------------------------------
# GET /auth/me
# ---------------------------------------------------------------------------
@router.get("/me", response_model=User)
def read_user_me(
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """Return the currently authenticated user's profile."""
    return current_user


# ---------------------------------------------------------------------------
# GET /auth/ping
# ---------------------------------------------------------------------------
@router.get("/ping")
def auth_ping():
    """Lightweight auth service check. No auth required."""
    return {"status": "ok", "service": "auth"}


# ---------------------------------------------------------------------------
# GET /auth/users
# ---------------------------------------------------------------------------
@router.get("/users", response_model=list[User])
def read_users(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """Retrieve all registered users for the Admin user directory panel."""
    users = db.query(UserModel).order_by(UserModel.id.desc()).all()
    return users
