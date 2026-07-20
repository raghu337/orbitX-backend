import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils.config import ValidationConfig

@pytest.mark.smoke
def test_login_fields_accessible(driver):
    """Verify that the login fields are loaded and interactive."""
    driver.get(ValidationConfig.TARGET_URL)
    
    # Locate inputs
    username_field = driver.find_element(By.ID, "username")
    password_field = driver.find_element(By.ID, "password")
    submit_btn = driver.find_element(By.ID, "login-btn")
    
    assert username_field.is_displayed(), "Username field is not visible"
    assert password_field.is_displayed(), "Password field is not visible"
    assert submit_btn.is_displayed(), "Login button is not visible"

@pytest.mark.regression
def test_invalid_login_error(driver):
    """Verify that entering invalid credentials raises a visible error alert."""
    driver.get(ValidationConfig.TARGET_URL)
    
    # Input incorrect values
    driver.find_element(By.ID, "username").send_keys("invalid@orbitx.com")
    driver.find_element(By.ID, "password").send_keys("wrongpass")
    driver.find_element(By.ID, "login-btn").click()
    
    # Wait for the general error element to become visible
    error_element = WebDriverWait(driver, ValidationConfig.DEFAULT_TIMEOUT).until(
        EC.visibility_of_element_located((By.ID, "general-error"))
    )
    
    assert error_element.is_displayed(), "Error message is not displayed"
    assert "Invalid email or password" in error_element.text, "Unexpected error text"

@pytest.mark.smoke
def test_valid_login_redirect(driver):
    """Verify that correct credentials log the user in and redirect to dashboard.html."""
    driver.get(ValidationConfig.TARGET_URL)
    
    # Input correct values
    driver.find_element(By.ID, "username").send_keys(ValidationConfig.USERNAME)
    driver.find_element(By.ID, "password").send_keys(ValidationConfig.PASSWORD)
    driver.find_element(By.ID, "login-btn").click()
    
    # Wait for URL redirect to dashboard
    WebDriverWait(driver, ValidationConfig.DEFAULT_TIMEOUT).until(
        EC.url_contains("dashboard.html")
    )
    
    assert "dashboard.html" in driver.current_url, f"Expected redirect to dashboard.html, got: {driver.current_url}"
