import pytest
from pages.dashboard_page import DashboardPage
from pages.login_page import LoginPage
from utils.config import Config


@pytest.mark.ui
@pytest.mark.auth
class TestOrbitXLogin:
    """Verifies authentication flows for valid and invalid credentials."""

    def test_login_valid_credentials(self, driver):
        """Verify login succeeds with correct credentials and loads dashboard."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)

        login_page.navigate_to("login.html")
        login_page.login(Config.USERNAME, Config.PASSWORD)

        assert dashboard_page.is_logout_button_visible(), "Logout button not visible after login."
        assert dashboard_page.get_profile_name() == "Reddy RaghuVardhan", "Incorrect profile name shown."

    def test_login_invalid_credentials(self, driver):
        """Verify login fails with incorrect credentials and displays General Error."""
        login_page = LoginPage(driver)

        login_page.navigate_to("login.html")
        login_page.login("wrong@orbitx.com", "wrongpassword")

        assert login_page.is_general_error_visible(), "General error warning was not shown."
        assert login_page.get_general_error_text() == "Invalid email or password."
