import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils.config import ValidationConfig

@pytest.mark.performance
def test_portal_load_performance(driver):
    """Verify that the landing portal page load latency is within the acceptable threshold."""
    driver.get(ValidationConfig.TARGET_URL)
    
    # Extract Navigation Timing details via JS executor
    navigation_start = driver.execute_script("return window.performance.timing.navigationStart;")
    load_event_end = driver.execute_script("return window.performance.timing.loadEventEnd;")
    
    # Fallback to current time diff if loadEventEnd has not completed yet
    if load_event_end == 0:
        load_event_end = driver.execute_script("return Date.now();")
        
    latency_ms = load_event_end - navigation_start
    
    assert latency_ms <= ValidationConfig.PERFORMANCE_THRESHOLD_MS, \
        f"Page load time ({latency_ms}ms) exceeded acceptable threshold ({ValidationConfig.PERFORMANCE_THRESHOLD_MS}ms)"

@pytest.mark.performance
def test_dashboard_load_performance(driver):
    """Verify that the dashboard screen loads within performance limits post-login."""
    driver.get(ValidationConfig.TARGET_URL)
    
    # Log in
    driver.find_element(By.ID, "username").send_keys(ValidationConfig.USERNAME)
    driver.find_element(By.ID, "password").send_keys(ValidationConfig.PASSWORD)
    driver.find_element(By.ID, "login-btn").click()
    
    # Wait for dashboard.html to redirect
    WebDriverWait(driver, ValidationConfig.DEFAULT_TIMEOUT).until(
        EC.url_contains("dashboard.html")
    )
    
    # Compute dashboard load latency
    navigation_start = driver.execute_script("return window.performance.timing.navigationStart;")
    load_event_end = driver.execute_script("return window.performance.timing.loadEventEnd;")
    
    if load_event_end == 0:
        load_event_end = driver.execute_script("return Date.now();")
        
    latency_ms = load_event_end - navigation_start
    
    assert latency_ms <= ValidationConfig.PERFORMANCE_THRESHOLD_MS, \
        f"Dashboard page load time ({latency_ms}ms) exceeded acceptable threshold ({ValidationConfig.PERFORMANCE_THRESHOLD_MS}ms)"
