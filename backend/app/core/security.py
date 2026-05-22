import asyncio
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """Create a JWT access token synchronously (fast, no blocking)."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Synchronous password verification — use async_verify_password in async routes."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Synchronous password hashing — use async_hash_password in async routes."""
    return pwd_context.hash(password)


async def async_verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Async wrapper for bcrypt password verification.
    
    CRITICAL: bcrypt is CPU-intensive and BLOCKS the event loop if called directly
    inside an async function. This wrapper runs it in a thread executor so the
    event loop remains free to process other requests and send responses.
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, verify_password, plain_password, hashed_password)


async def async_hash_password(password: str) -> str:
    """
    Async wrapper for bcrypt password hashing.
    Same reason as async_verify_password — never block the event loop.
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, get_password_hash, password)
