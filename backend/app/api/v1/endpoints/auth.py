import time
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.core import deps, security
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.token import Token
from app.schemas.user import User, UserCreate

router = APIRouter()


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------
@router.post("/login", response_model=Token)
async def login_access_token(
    request: Request,
    db_conn: Any = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2-compatible login.
    Returns a JWT bearer token on success.
    """
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"
    print(f"\n{'='*55}")
    print("[Auth] LOGIN REQUEST")
    print(f"[Auth]   Email : {form_data.username}")
    print(f"[Auth]   IP    : {client_ip}")
    print(f"{'='*55}")

    # Step 1: Firebase user lookup by email
    print("[Auth] Step 1/4: Querying Firebase...")
    try:
        ref = db_conn.reference("users")
        users_data = ref.order_by_child("email").equal_to(form_data.username).get()
    except Exception as db_err:
        elapsed = round((time.time() - start_time) * 1000)
        print(f"[Auth] FAIL: Firebase query error after {elapsed}ms: {db_err}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database temporarily unavailable. Please try again.",
        )

    user = None
    if users_data:
        user_id = list(users_data.keys())[0]
        user_dict = list(users_data.values())[0]
        uid = int(user_id) if user_id.isdigit() else user_id
        user = UserModel(
            id=uid,
            name=user_dict.get("name"),
            email=user_dict.get("email"),
            password_hash=user_dict.get("password_hash"),
            role=user_dict.get("role"),
            created_at=user_dict.get("created_at")
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

    # Step 2: Password verification
    print("[Auth] Step 2/4: Verifying password...")
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
            str(user.id), expires_delta=access_token_expires
        )
    except Exception as jwt_err:
        elapsed = round((time.time() - start_time) * 1000)
        print(f"[Auth] FAIL: JWT generation error after {elapsed}ms: {jwt_err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token generation failed. Please try again.",
        )
    print("[Auth] Step 3 OK: Token generated")

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
    db_conn: Any = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """Register a new user account."""
    print(f"[Auth] SIGNUP REQUEST for: {user_in.email}")

    ref = db_conn.reference("users")
    existing_data = ref.order_by_child("email").equal_to(user_in.email).get()
    if existing_data:
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

    user_id = int(time.time() * 1000)
    user_data = {
        "id": user_id,
        "email": user_in.email,
        "password_hash": hashed_pw,
        "name": user_in.name or "Space Explorer",
        "role": user_in.role or "user",
        "created_at": datetime.utcnow().isoformat()
    }
    try:
        ref.child(str(user_id)).set(user_data)
    except Exception as e:
        print(f"[Auth] FAIL: Firebase error during signup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create account. Please try again.",
        )

    print(f"[Auth] SIGNUP OK: id={user_id} email={user_in.email}")
    return User(
        id=user_id,
        email=user_data["email"],
        name=user_data["name"],
        role=user_data["role"],
        created_at=datetime.fromisoformat(user_data["created_at"])
    )


# ---------------------------------------------------------------------------
# GET /auth/me
# ---------------------------------------------------------------------------
@router.get("/me", response_model=User)
def read_user_me(
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """Return the currently authenticated user's profile."""
    return User(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        created_at=datetime.fromisoformat(current_user.created_at) if isinstance(current_user.created_at, str) else current_user.created_at
    )


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
    db_conn: Any = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """Retrieve all registered users for the Admin user directory panel."""
    users_data = db_conn.reference("users").get() or {}
    users_list = []
    for u_id, u_val in users_data.items():
        uid = int(u_id) if u_id.isdigit() else u_id
        created_at_val = u_val.get("created_at")
        if isinstance(created_at_val, str):
            created_at_val = datetime.fromisoformat(created_at_val)
        users_list.append(User(
            id=uid,
            name=u_val.get("name"),
            email=u_val.get("email"),
            role=u_val.get("role"),
            created_at=created_at_val
        ))
    users_list.sort(key=lambda x: x.id if isinstance(x.id, int) else 0, reverse=True)
    return users_list


# ---------------------------------------------------------------------------
# POST /auth/forgot-password
# ---------------------------------------------------------------------------
class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/forgot-password")
async def forgot_password(
    request: Request,
    body: ForgotPasswordRequest,
    db_conn: Any = Depends(get_db),
) -> Any:
    """
    Password reset request endpoint.
    Checks if email exists in database and triggers a mock reset email.
    """
    email = body.email.strip()
    print(f"\n[Auth] FORGOT PASSWORD REQUEST for: {email}")

    # Check if user exists in Firebase Realtime Database
    try:
        ref = db_conn.reference("users")
        users_data = ref.order_by_child("email").equal_to(email).get()
        user_exists = bool(users_data)
    except Exception as db_err:
        print(f"[Auth] Firebase DB not initialized or query failed: {db_err}")
        mock_emails = {"astronaut@orbitx.com", "jhuvamma548@gmail.comt", "test@example.com"}
        if email in mock_emails:
            print(f"[Auth] Fallback: Mock user found for local testing: {email}")
            user_exists = True
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database temporarily unavailable. Please try again.",
            )

    if not user_exists:
        print(f"[Auth] FAIL: Email not found: {email}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account registered with this email address.",
        )

    # Simulate sending password reset email
    print(f"[Auth] SUCCESS: User found. Sending password reset email to {email}...")
    print("===========================================================")
    print("SMTP OUTGOING MAIL:")
    print(f"  To: {email}")
    print("  From: support@orbitx.com")
    print("  Subject: OrbitX - Password Reset Notification")
    print("  Body: Please click the link to reset your password: http://orbitx.com/reset-password")
    print("===========================================================")

    return {
        "success": True,
        "message": "A password reset notification has been sent to your registered email address."
    }

