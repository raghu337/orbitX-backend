from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class LoginPage(BasePage):
    """Page object representing the Login portal page."""
    
    # Locators
    USERNAME_INPUT = (By.ID, "username")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "login-btn")
    
    # Error message locators
    GENERAL_ERROR = (By.ID, "general-error")
    USERNAME_ERROR = (By.ID, "username-error")
    PASSWORD_ERROR = (By.ID, "password-error")

    def login(self, username, password):
        """Execute a login flow."""
        self.type(self.USERNAME_INPUT, username)
        self.type(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)

    def is_login_page_loaded(self):
        """Verify the login fields are visible."""
        return self.is_visible(self.USERNAME_INPUT) and self.is_visible(self.PASSWORD_INPUT)

    def get_general_error_text(self):
        """Fetch general authentication error string."""
        return self.get_text(self.GENERAL_ERROR)

    def is_username_error_visible(self):
        """Verify username field validation indicator."""
        return self.is_visible(self.USERNAME_ERROR)

    def is_password_error_visible(self):
        """Verify password field validation indicator."""
        return self.is_visible(self.PASSWORD_ERROR)
        
    def get_username_error_text(self):
        return self.get_text(self.USERNAME_ERROR)

    def get_password_error_text(self):
        return self.get_text(self.PASSWORD_ERROR)
