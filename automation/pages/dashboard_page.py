from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class DashboardPage(BasePage):
    """Encapsulates dashboard page actions."""
    
    PROFILE_NAME = (By.ID, "profile-name")
    CONTENT_TITLE = (By.ID, "content-title")
    LOGOUT_BUTTON = (By.ID, "logout-btn")
    
    def get_profile_name(self):
        """Extract the profile name string displayed in user card."""
        return self.get_text(self.PROFILE_NAME)

    def is_logout_button_visible(self):
        """Verify logout button availability."""
        return self.is_visible(self.LOGOUT_BUTTON)

    def click_logout(self):
        """Click logout button."""
        self.click(self.LOGOUT_BUTTON)

    def is_dashboard_loaded(self):
        """Verify profile name and logout button are visible."""
        return self.is_visible(self.PROFILE_NAME) and self.is_visible(self.LOGOUT_BUTTON)

