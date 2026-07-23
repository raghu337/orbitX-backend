from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "OrbitX Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FIREBASE_CREDENTIALS_PATH: str = "firebase-credentials.json"
    FIREBASE_DATABASE_URL: str = "https://orbit-x-43dc3-default-rtdb.asia-southeast1.firebasedatabase.app/"
    N2YO_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
