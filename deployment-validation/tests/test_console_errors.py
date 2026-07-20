import pytest
from utils.config import ValidationConfig

@pytest.mark.regression
def test_javascript_console_errors(driver):
    """Verify that loading the landing page does not produce severe JavaScript console errors."""
    driver.get(ValidationConfig.TARGET_URL)
    
    # Retrieve logs from the browser console
    logs = driver.get_log("browser")
    
    # Filter logs of level SEVERE
    severe_errors = [log for log in logs if log.get("level") == "SEVERE"]
    
    # Assert there are no severe errors
    assert len(severe_errors) == 0, f"Detected {len(severe_errors)} severe console errors: {severe_errors}"
