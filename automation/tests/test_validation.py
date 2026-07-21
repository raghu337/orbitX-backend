import pytest
from pages.login_page import LoginPage


@pytest.mark.ui
class TestOrbitXValidation:
    """Verifies fields validation warnings and error messaging layouts."""

    def test_empty_username_validation(self, driver):
        """Verify password field alone triggers username validation check."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")

        login_page.type(login_page.PASSWORD_INPUT, "password123")
        login_page.click(login_page.LOGIN_BUTTON)

        assert login_page.is_username_error_visible(), "Username error warning not shown."
        assert login_page.get_username_error_text() == "Username is required."

    def test_empty_password_validation(self, driver):
        """Verify username field alone triggers password validation check."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")

        login_page.type(login_page.USERNAME_INPUT, "astronaut@orbitx.com")
        login_page.click(login_page.LOGIN_BUTTON)

        assert login_page.is_password_error_visible(), "Password error warning not shown."
        assert login_page.get_password_error_text() == "Password is required."

    def test_error_messages_displayed_correctly(self, driver):
        """Verify all validation errors are displayed correctly when submitting empty form."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")

        login_page.click(login_page.LOGIN_BUTTON)

        assert login_page.is_username_error_visible(), "Username error warning not shown."
        assert login_page.is_password_error_visible(), "Password error warning not shown."
        assert login_page.get_username_error_text() == "Username is required."
        assert login_page.get_password_error_text() == "Password is required."
