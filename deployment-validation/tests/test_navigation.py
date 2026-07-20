import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils.config import ValidationConfig

@pytest.mark.smoke
def test_sidebar_navigation(driver):
    """Verify that clicking sidebar items changes active section state correctly."""
    driver.get(ValidationConfig.TARGET_URL)
    
    # Authenticate
    driver.find_element(By.ID, "username").send_keys(ValidationConfig.USERNAME)
    driver.find_element(By.ID, "password").send_keys(ValidationConfig.PASSWORD)
    driver.find_element(By.ID, "login-btn").click()
    
    # Wait for dashboard to resolve
    WebDriverWait(driver, ValidationConfig.DEFAULT_TIMEOUT).until(
        EC.url_contains("dashboard.html")
    )
    
    # Locate sidebar navigation links
    nav_radar = WebDriverWait(driver, ValidationConfig.DEFAULT_TIMEOUT).until(
        EC.element_to_be_clickable((By.ID, "nav-satellite-radar"))
    )
    
    nav_radar.click()
    assert "active" in nav_radar.get_attribute("class"), "Satellite Radar tab did not activate."
    
    nav_notes = driver.find_element(By.ID, "nav-space-notes")
    nav_notes.click()
    assert "active" in nav_notes.get_attribute("class"), "Space Notes tab did not activate."
