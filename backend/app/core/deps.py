from typing import Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Any = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    ref = db.reference(f"users/{user_id}")
    user_data = ref.get()
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
        
    return User(
        id=user_data.get("id"),
        name=user_data.get("name"),
        email=user_data.get("email"),
        password_hash=user_data.get("password_hash"),
        role=user_data.get("role"),
        created_at=user_data.get("created_at")
    )
