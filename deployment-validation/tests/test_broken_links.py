import pytest
import requests
from selenium.webdriver.common.by import By
from utils.config import ValidationConfig

@pytest.mark.regression
def test_no_broken_internal_links(driver):
    """Verify that there are no broken local internal links on the portal page."""
    driver.get(ValidationConfig.TARGET_URL)
    
    # Locate all link elements
    links = driver.find_elements(By.TAG_NAME, "a")
    
    internal_urls = set()
    base_url = ValidationConfig.TARGET_URL.rsplit('/', 1)[0]
    
    for link in links:
        href = link.get_attribute("href")
        if href:
            # Normalize and filter only internal links
            if href.startswith(base_url) or href.startswith("/"):
                # Complete relative paths
                full_url = href if href.startswith("http") else f"{base_url}{href}"
                # Exclude hash bookmarks
                full_url = full_url.split('#')[0]
                internal_urls.add(full_url)
                
    broken_links = []
    
    # Check status of each link
    for url in internal_urls:
        try:
            response = requests.head(url, timeout=ValidationConfig.SHORT_TIMEOUT, allow_redirects=True)
            # Fallback to GET if HEAD method is not allowed by server configuration
            if response.status_code == 405:
                response = requests.get(url, timeout=ValidationConfig.SHORT_TIMEOUT)
                
            if response.status_code >= 400:
                broken_links.append(f"{url} (Status: {response.status_code})")
        except requests.exceptions.RequestException as e:
            broken_links.append(f"{url} (Error: {str(e)})")
            
    assert len(broken_links) == 0, f"Detected broken internal links: {broken_links}"
