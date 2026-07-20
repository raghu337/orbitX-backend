import pytest
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from pages.navigation_page import NavigationPage
from utils.config import Config

@pytest.mark.ui
class TestOrbitXNavigation:
    """Verifies that navigation items switch tabs and update classes."""

    def test_navigation_menu_functionality(self, driver):
        """Verify navigation menu links switch active panels and set classes."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        nav_page = NavigationPage(driver)

        # Authenticate first
        login_page.navigate_to("login.html")
        login_page.login(Config.USERNAME, Config.PASSWORD)
        assert dashboard_page.is_logout_button_visible()

        # Click Planet Explorer
        nav_page.click_planet_explorer()
        assert nav_page.is_tab_active(nav_page.NAV_PLANET_EXPLORER), "Planet Explorer tab not active."

        # Click Space Notes
        nav_page.click_space_notes()
        assert nav_page.is_tab_active(nav_page.NAV_SPACE_NOTES), "Space Notes tab not active."

        # Click Satellite Radar
        nav_page.click_satellite_radar()
        assert nav_page.is_tab_active(nav_page.NAV_SATELLITE_RADAR), "Satellite Radar tab not active."
