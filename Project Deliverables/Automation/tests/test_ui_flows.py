import os
import pytest
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from pages.navigation_page import NavigationPage

@pytest.mark.ui
class TestOrbitXUIFlows:
    """End-to-End UI and authentication validation suite for the OrbitX Web Workspace."""

    @property
    def credentials(self):
        username = os.environ.get("ORBITX_USERNAME") or "astronaut@orbitx.com"
        password = os.environ.get("ORBITX_PASSWORD") or "password123"
        return username, password

    @property
    def expected_profile(self):
        return os.environ.get("ORBITX_PROFILE_NAME") or "Reddy RaghuVardhan"

    def test_homepage_loads(self, driver):
        """Verify the homepage/login portal loads correctly and renders input elements."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")
        assert login_page.is_login_page_loaded(), "Login page failed to load fields."
        assert "Login Portal" in driver.title, "Wrong login portal title."

    def test_login_valid_credentials(self, driver):
        """Verify a user can log in with valid credentials and lands on the dashboard."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        
        login_page.navigate_to("login.html")
        username, password = self.credentials
        login_page.login(username, password)
        
        assert dashboard_page.is_dashboard_loaded(), "Dashboard failed to load after valid login."
        assert dashboard_page.get_profile_name() == self.expected_profile, "Incorrect profile name displayed."

    def test_login_invalid_credentials(self, driver):
        """Verify login fails with invalid credentials and shows an error message."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")
        
        login_page.login("wrong@orbitx.com", "wrongpass")
        
        assert login_page.is_visible(login_page.GENERAL_ERROR), "Authentication error message was not shown."
        assert login_page.get_general_error_text() == "Invalid email or password.", "Error text mismatch."

    def test_logout(self, driver):
        """Verify logging out clears session context and redirects the browser to login."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        
        login_page.navigate_to("login.html")
        username, password = self.credentials
        login_page.login(username, password)
        
        assert dashboard_page.is_dashboard_loaded(), "Setup valid login failed."
        dashboard_page.logout()
        
        assert login_page.is_login_page_loaded(), "Failed to redirect back to login page after logout."
        assert "login.html" in driver.current_url, "Browser URL was not updated to login page."

    def test_session_persistence_after_refresh(self, driver):
        """Verify session details persist across browser refreshes/reloads."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        
        login_page.navigate_to("login.html")
        username, password = self.credentials
        login_page.login(username, password)
        assert dashboard_page.is_dashboard_loaded(), "Dashboard setup failed."
        
        dashboard_page.refresh()
        
        assert dashboard_page.is_dashboard_loaded(), "Session was lost after refreshing the page."
        assert dashboard_page.get_profile_name() == self.expected_profile, "Profile lost after refresh."

    def test_unauthorized_access_redirects_to_login(self, driver):
        """Verify trying to load the dashboard directly without a session redirects to login."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        
        # Navigate to dashboard without setting localStorage session
        dashboard_page.navigate_to("dashboard.html")
        
        # Verify redirect
        assert login_page.is_login_page_loaded(), "User was not redirected back to the login page."
        assert "login.html" in driver.current_url, "Redirect URL was not set to login.html."

    def test_navigation_between_pages(self, driver):
        """Verify sidebar navigation tabs load correct content titles and change active state."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        nav_page = NavigationPage(driver)
        
        login_page.navigate_to("login.html")
        username, password = self.credentials
        login_page.login(username, password)
        assert dashboard_page.is_dashboard_loaded()
        
        # Go to Satellite Radar
        nav_page.click_satellite_radar_tab()
        assert nav_page.is_tab_active(nav_page.NAV_SATELLITE_RADAR), "Satellite Radar tab not marked active."
        assert dashboard_page.get_content_title() == "Satellite Radar Telemetry", "Content title mismatch."
        
        # Go to 3D Solar System
        nav_page.click_solar_system_tab()
        assert nav_page.is_tab_active(nav_page.NAV_SOLAR_SYSTEM), "Solar System tab not marked active."
        assert dashboard_page.get_content_title() == "3D Solar System Simulator", "Content title mismatch."
        
        # Go to Launch Hub
        nav_page.click_launch_hub_tab()
        assert nav_page.is_tab_active(nav_page.NAV_LAUNCH_HUB), "Launch Hub tab not marked active."
        assert dashboard_page.get_content_title() == "Launch Hub Cockpit", "Content title mismatch."

        # Go to System Settings
        nav_page.click_settings_tab()
        assert nav_page.is_tab_active(nav_page.NAV_SETTINGS), "Settings tab not marked active."
        assert dashboard_page.get_content_title() == "System Settings Workspace", "Content title mismatch."

    def test_form_validation(self, driver):
        """Verify UI displays validation warning markers for empty login submissions."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")
        
        # Click login without typing credentials
        login_page.click(login_page.LOGIN_BUTTON)
        
        assert login_page.is_username_error_visible(), "Username error warning not shown."
        assert login_page.is_password_error_visible(), "Password error warning not shown."

    def test_error_message_verification(self, driver):
        """Verify the exact text phrasing of validation and credential error states."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")
        
        # Check validation text
        login_page.click(login_page.LOGIN_BUTTON)
        assert login_page.get_username_error_text() == "Username is required."
        assert login_page.get_password_error_text() == "Password is required."
        
        # Check credentials invalid text
        login_page.login("invalid", "invalid")
        assert login_page.get_general_error_text() == "Invalid email or password."
