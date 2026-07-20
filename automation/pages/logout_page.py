from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.base_page import BasePage
from utils.config import Config

class LogoutPage(BasePage):
    """Verifies redirections and states during logout procedures."""
    
    def is_redirected_to_login(self, timeout=Config.DEFAULT_TIMEOUT):
        """Confirm that the page redirects to the login screen using explicit waits."""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.title_contains("Login")
            )
            return True
        except Exception:
            return False
