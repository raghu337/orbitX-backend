from pages.base_page import BasePage
from selenium.webdriver.common.by import By


class LoginPage(BasePage):
    """Encapsulates locators and user behaviors for the login screen."""

    # Locators
    USERNAME_INPUT = (By.ID, "username")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "login-btn")

    USERNAME_ERROR = (By.ID, "username-error")
    PASSWORD_ERROR = (By.ID, "password-error")
    GENERAL_ERROR = (By.ID, "general-error")

    APP_LOGO = (By.ID, "app-logo")

    def is_login_page_loaded(self):
        """Verify username, password and login button are visible."""
        return self.is_visible(self.USERNAME_INPUT) and self.is_visible(self.PASSWORD_INPUT)

    def login(self, username, password):
        """Submit the login form with credentials."""
        self.type(self.USERNAME_INPUT, username)
        self.type(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)

    def is_username_error_visible(self):
        return self.is_visible(self.USERNAME_ERROR)

    def is_password_error_visible(self):
        return self.is_visible(self.PASSWORD_ERROR)

    def is_general_error_visible(self):
        return self.is_visible(self.GENERAL_ERROR)

    def get_username_error_text(self):
        return self.get_text(self.USERNAME_ERROR)

    def get_password_error_text(self):
        return self.get_text(self.PASSWORD_ERROR)

    def get_general_error_text(self):
        return self.get_text(self.GENERAL_ERROR)
