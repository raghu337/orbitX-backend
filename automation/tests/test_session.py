import pytest
from pages.dashboard_page import DashboardPage
from pages.login_page import LoginPage
from pages.logout_page import LogoutPage
from utils.config import Config


@pytest.mark.ui
@pytest.mark.auth
class TestOrbitXSession:
    """Verifies that authentication guards and session persistence are respected."""

    def test_protected_pages_require_authentication(self, driver):
        """Verify navigation directly to dashboard.html redirects to login.html if unauthenticated."""
        logout_page = LogoutPage(driver)

        # Navigate directly to protected dashboard page
        logout_page.navigate_to("dashboard.html")

        # Verify unauthenticated redirection
        assert logout_page.is_redirected_to_login(), "Direct dashboard access did not redirect unauthenticated session."

    def test_browser_refresh_maintains_session(self, driver):
        """Verify that refreshing the browser maintains authenticated dashboard view."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)

        # Login
        login_page.navigate_to("login.html")
        login_page.login(Config.USERNAME, Config.PASSWORD)
        assert dashboard_page.is_logout_button_visible()

        # Refresh
        driver.refresh()

        # Verify authenticated session persists
        assert dashboard_page.is_logout_button_visible(), "Session lost after page refresh."
        assert dashboard_page.get_profile_name() == "Reddy RaghuVardhan", "Incorrect profile name after refresh."
