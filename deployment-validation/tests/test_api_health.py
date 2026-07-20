import pytest
import requests
from utils.config import ValidationConfig

@pytest.mark.smoke
def test_api_health_check():
    """Verify that the API health check endpoint (or server root) returns HTTP 200."""
    target_url = ValidationConfig.TARGET_URL.rstrip('/')
    
    # Attempt to ping /health first
    health_url = f"{target_url}/health"
    try:
        response = requests.get(health_url, timeout=ValidationConfig.SHORT_TIMEOUT)
        if response.status_code == 200:
            # Valid API health check
            assert response.status_code == 200
            return
    except requests.exceptions.RequestException:
        pass
        
    # If /health fails or is missing, fall back to checking the main portal entry point
    portal_url = f"{target_url}/login.html" if "127.0.0.1" in target_url or "localhost" in target_url else target_url
    response = requests.get(portal_url, timeout=ValidationConfig.SHORT_TIMEOUT)
    assert response.status_code == 200, f"Target portal URL {portal_url} is unreachable (Status: {response.status_code})"
