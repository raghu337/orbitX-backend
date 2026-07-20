import pytest
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from pages.logout_page import LogoutPage
from utils.config import Config

@pytest.mark.ui
@pytest.mark.auth
class TestOrbitXLogout:
    """Verifies that user logout clears sessions and redirects to login."""

    def test_logout_functionality(self, driver):
        """Verify logout returns user back to the login page."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        logout_page = LogoutPage(driver)

        # Login
        login_page.navigate_to("login.html")
        login_page.login(Config.USERNAME, Config.PASSWORD)
        assert dashboard_page.is_logout_button_visible()

        # Logout
        dashboard_page.click_logout()
        assert logout_page.is_redirected_to_login(), "Redirect did not return to login page after logout."
