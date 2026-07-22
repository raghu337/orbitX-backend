import os


class Config:
    """Manages credentials and base URL parameters from system environment."""
    BASE_URL = os.environ.get("BASE_URL") or "http://127.0.0.1:8080"
    USERNAME = os.environ.get("ORBITX_USERNAME") or "astronaut@orbitx.com"
    PASSWORD = os.environ.get("ORBITX_PASSWORD") or "password123"

    # Timeout settings
    DEFAULT_TIMEOUT = 10
    SHORT_TIMEOUT = 5
