import pytest
import requests
from selenium.webdriver.common.by import By
from utils.config import ValidationConfig

@pytest.mark.assets
def test_static_assets_load_successfully(driver):
    """Verify that CSS, scripts, and image assets load successfully without errors."""
    driver.get(ValidationConfig.TARGET_URL)
    
    base_url = ValidationConfig.TARGET_URL.rsplit('/', 1)[0]
    asset_urls = set()
    
    # Gather CSS links
    css_elements = driver.find_elements(By.XPATH, "//link[@rel='stylesheet']")
    for elem in css_elements:
        href = elem.get_attribute("href")
        if href:
            asset_urls.add(href)
            
    # Gather JS scripts
    js_elements = driver.find_elements(By.XPATH, "//script[@src]")
    for elem in js_elements:
        src = elem.get_attribute("src")
        if src:
            asset_urls.add(src)
            
    # Gather Images
    img_elements = driver.find_elements(By.XPATH, "//img[@src]")
    for elem in img_elements:
        src = elem.get_attribute("src")
        if src:
            asset_urls.add(src)
            
    failed_assets = []
    
    # Validate each asset returns HTTP 200/300
    for url in asset_urls:
        if not url.startswith("http"):
            url = f"{base_url}/{url.lstrip('/')}"
        try:
            response = requests.get(url, timeout=ValidationConfig.SHORT_TIMEOUT)
            if response.status_code >= 400:
                failed_assets.append(f"{url} (Status: {response.status_code})")
        except requests.exceptions.RequestException as e:
            failed_assets.append(f"{url} (Error: {str(e)})")
            
    assert len(failed_assets) == 0, f"Detected missing/broken static assets: {failed_assets}"
