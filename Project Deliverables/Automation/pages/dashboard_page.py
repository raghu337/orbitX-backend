from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class DashboardPage(BasePage):
    """Page object representing the OrbitX Main Dashboard page."""
    
    # Locators
    CONTENT_TITLE = (By.ID, "content-title")
    PROFILE_NAME = (By.ID, "profile-name")
    LOGOUT_BUTTON = (By.ID, "logout-btn")

    def is_dashboard_loaded(self):
        """Verify dashboard widgets and profile card are loaded."""
        return self.is_visible(self.PROFILE_NAME) and self.is_visible(self.CONTENT_TITLE)

    def get_profile_name(self):
        """Fetch active user profile name from card."""
        return self.get_text(self.PROFILE_NAME)

    def get_content_title(self):
        """Fetch active workspace panel title."""
        return self.get_text(self.CONTENT_TITLE)

    def logout(self):
        """Trigger session logout."""
        self.click(self.LOGOUT_BUTTON)
