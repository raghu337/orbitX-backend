import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils.config import ValidationConfig

@pytest.mark.regression
def test_dashboard_requires_authentication(driver):
    """Verify that accessing dashboard.html directly redirects unauthenticated users to the login page."""
    # Attempt direct navigation
    base_url = ValidationConfig.TARGET_URL.rsplit('/', 1)[0]
    driver.get(f"{base_url}/dashboard.html")
    
    # Wait for the login screen to resolve
    WebDriverWait(driver, ValidationConfig.DEFAULT_TIMEOUT).until(
        EC.url_contains("login.html")
    )
    
    assert "login.html" in driver.current_url, "User was not redirected back to the login page."

@pytest.mark.smoke
def test_dashboard_components_load(driver):
    """Verify that critical dashboard telemetry widgets load after logging in."""
    driver.get(ValidationConfig.TARGET_URL)
    
    # Log in
    driver.find_element(By.ID, "username").send_keys(ValidationConfig.USERNAME)
    driver.find_element(By.ID, "password").send_keys(ValidationConfig.PASSWORD)
    driver.find_element(By.ID, "login-btn").click()
    
    # Wait for dashboard components to resolve
    WebDriverWait(driver, ValidationConfig.DEFAULT_TIMEOUT).until(
        EC.url_contains("dashboard.html")
    )
    
    # Check elements (e.g., telemetry cards, sidebar controls, HUD data)
    sidebar = WebDriverWait(driver, ValidationConfig.DEFAULT_TIMEOUT).until(
        EC.presence_of_element_located((By.CLASS_NAME, "sidebar"))
    )
    assert sidebar.is_displayed(), "Dashboard sidebar did not load."
