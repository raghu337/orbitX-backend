from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "OrbitX Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str
    N2YO_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
