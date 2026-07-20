import os
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    """Base class for Page Objects providing common element actions with explicit waits."""
    
    def __init__(self, driver, base_url=None):
        self.driver = driver
        self.base_url = base_url or os.environ.get("BASE_URL") or "http://127.0.0.1:8080"

    def navigate_to(self, path=""):
        self.driver.get(f"{self.base_url}/{path}")

    def find_element(self, locator, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(locator)
        )

    def find_present_element(self, locator, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(locator)
        )

    def click(self, locator, timeout=10):
        self.find_element(locator, timeout).click()

    def type(self, locator, text, timeout=10):
        element = self.find_element(locator, timeout)
        element.clear()
        element.send_keys(text)

    def get_text(self, locator, timeout=10):
        return self.find_element(locator, timeout).text

    def is_visible(self, locator, timeout=10):
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(locator)
            ).is_displayed()
        except:
            return False

    def refresh(self):
        self.driver.refresh()
        
    def get_current_url(self):
        return self.driver.current_url
