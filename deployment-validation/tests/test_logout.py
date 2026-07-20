import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils.config import ValidationConfig

@pytest.mark.smoke
def test_logout_terminates_session(driver):
    """Verify that clicking logout button destroys sessionToken and routes back to login.html."""
    driver.get(ValidationConfig.TARGET_URL)
    
    # Log in
    driver.find_element(By.ID, "username").send_keys(ValidationConfig.USERNAME)
    driver.find_element(By.ID, "password").send_keys(ValidationConfig.PASSWORD)
    driver.find_element(By.ID, "login-btn").click()
    
    # Wait for dashboard
    WebDriverWait(driver, ValidationConfig.DEFAULT_TIMEOUT).until(
        EC.url_contains("dashboard.html")
    )
    
    # Click logout
    logout_btn = WebDriverWait(driver, ValidationConfig.DEFAULT_TIMEOUT).until(
        EC.element_to_be_clickable((By.ID, "logout-btn"))
    )
    logout_btn.click()
    
    # Wait for redirect back to login
    WebDriverWait(driver, ValidationConfig.DEFAULT_TIMEOUT).until(
        EC.url_contains("login.html")
    )
    
    # Check that localStorage is empty
    token = driver.execute_script("return localStorage.getItem('sessionToken');")
    assert token is None, "localStorage sessionToken was not removed on logout"
