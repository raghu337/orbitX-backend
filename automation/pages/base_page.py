from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils.config import Config
from utils.logger import get_logger

class BasePage:
    """Base POM Page class providing common element find/type/click methods."""
    
    def __init__(self, driver):
        self.driver = driver
        self.base_url = Config.BASE_URL.rstrip('/')
        self.logger = get_logger(self.__class__.__name__)

    def navigate_to(self, path):
        """Navigate to a subpath of the configured base URL."""
        url = f"{self.base_url}/{path.lstrip('/')}"
        self.logger.info(f"Navigating to URL: {url}")
        self.driver.get(url)

    def find_element(self, locator, timeout=Config.DEFAULT_TIMEOUT):
        """Wait for and return a visible web element."""
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(locator)
        )

    def click(self, locator, timeout=Config.DEFAULT_TIMEOUT):
        """Wait for element to be clickable and click."""
        self.logger.info(f"Clicking element: {locator}")
        element = WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable(locator)
        )
        element.click()

    def type(self, locator, text, timeout=Config.DEFAULT_TIMEOUT):
        """Wait for element to be visible, clear field, and type text."""
        self.logger.info(f"Typing text '{text}' into element: {locator}")
        element = self.find_element(locator, timeout)
        element.clear()
        element.send_keys(text)

    def is_visible(self, locator, timeout=Config.SHORT_TIMEOUT):
        """Return boolean indicator of visibility status."""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(locator)
            )
            return True
        except Exception:
            return False

    def get_text(self, locator, timeout=Config.DEFAULT_TIMEOUT):
        """Wait for element to be visible and return text contents."""
        element = self.find_element(locator, timeout)
        return element.text

    def set_range_value(self, locator, value, timeout=Config.DEFAULT_TIMEOUT):
        """Set the value of an input range slider via JavaScript and trigger change/input events."""
        element = self.find_element(locator, timeout)
        self.logger.info(f"Setting range slider value to {value} on element: {locator}")
        self.driver.execute_script(
            "arguments[0].value = arguments[1]; "
            "arguments[0].dispatchEvent(new Event('change', { bubbles: true })); "
            "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", 
            element, value
        )

    def get_local_storage_item(self, key):
        """Retrieve a value from localStorage."""
        return self.driver.execute_script("return localStorage.getItem(arguments[0]);", key)

    def set_local_storage_item(self, key, value):
        """Set a value in localStorage."""
        self.driver.execute_script("localStorage.setItem(arguments[0], arguments[1]);", key, value)

    def clear_local_storage(self):
        """Clear localStorage."""
        self.driver.execute_script("localStorage.clear();")

