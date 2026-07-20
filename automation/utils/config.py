import os

class Config:
    """Manages credentials and base URL parameters from system environment."""
    BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8080")
    USERNAME = os.environ.get("ORBITX_USERNAME", "astronaut@orbitx.com")
    PASSWORD = os.environ.get("ORBITX_PASSWORD", "password123")
    
    # Timeout settings
    DEFAULT_TIMEOUT = 10
    SHORT_TIMEOUT = 5
