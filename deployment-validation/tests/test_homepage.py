import pytest
from utils.config import ValidationConfig

@pytest.mark.smoke
def test_homepage_loads(driver):
    """Verify that the homepage loads successfully and displays application branding."""
    driver.get(ValidationConfig.TARGET_URL)
    
    # Assert branding exists in title or page source
    assert "OrbitX" in driver.title or "ORBITX" in driver.page_source, "Branding 'OrbitX' was not found on the page."
