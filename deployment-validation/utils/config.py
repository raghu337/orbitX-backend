import os

class ValidationConfig:
    """Manages credentials, base URL, and configuration for deployment verification tests."""
    
    # Target URL of the deployment to validate (default to local mock server)
    TARGET_URL = os.environ.get("TARGET_URL", os.environ.get("BASE_URL", "http://127.0.0.1:8080"))
    
    # Test User credentials
    USERNAME = os.environ.get("ORBITX_USERNAME", os.environ.get("USERNAME", "astronaut@orbitx.com"))
    PASSWORD = os.environ.get("ORBITX_PASSWORD", os.environ.get("PASSWORD", "password123"))
    
    # Timing limits
    DEFAULT_TIMEOUT = int(os.environ.get("DEFAULT_TIMEOUT_SECONDS", 10))
    SHORT_TIMEOUT = int(os.environ.get("SHORT_TIMEOUT_SECONDS", 5))
    
    # Maximum allowable load latency for web pages (in milliseconds)
    PERFORMANCE_THRESHOLD_MS = int(os.environ.get("PERF_THRESHOLD_MS", 3000))
