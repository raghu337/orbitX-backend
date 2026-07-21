import pytest
from pages.login_page import LoginPage


@pytest.mark.ui
class TestOrbitXDashboard:
    """Verifies homepage, logo, and page titles are correctly rendered."""

    def test_homepage_loads_successfully(self, driver):
        """Verify that the login/home screen is accessible and renders expected elements."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")
        assert login_page.is_visible(login_page.LOGIN_BUTTON), "Login button not visible on home screen."

    def test_page_titles(self, driver):
        """Verify the title of the browser aligns with OrbitX branding."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")
        assert driver.title == "OrbitX - Login Portal", f"Page title '{driver.title}' did not match expected value."

    def test_application_logo_home_link(self, driver):
        """Verify the application logo branding is visible."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")
        assert login_page.is_visible(login_page.APP_LOGO), "Application branding logo not visible."
