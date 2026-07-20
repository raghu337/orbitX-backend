from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class NavigationPage(BasePage):
    """Page object encapsulating the Sidebar Navigation components."""
    
    # Locators matching dashboard navigation buttons
    NAV_SPACE_NOTES = (By.ID, "nav-space-notes")
    NAV_SATELLITE_RADAR = (By.ID, "nav-satellite-radar")
    NAV_SOLAR_SYSTEM = (By.ID, "nav-solar-system")
    NAV_LAUNCH_HUB = (By.ID, "nav-launch-hub")
    NAV_SETTINGS = (By.ID, "nav-settings")

    def click_space_notes_tab(self):
        self.click(self.NAV_SPACE_NOTES)

    def click_satellite_radar_tab(self):
        self.click(self.NAV_SATELLITE_RADAR)

    def click_solar_system_tab(self):
        self.click(self.NAV_SOLAR_SYSTEM)

    def click_launch_hub_tab(self):
        self.click(self.NAV_LAUNCH_HUB)

    def click_settings_tab(self):
        self.click(self.NAV_SETTINGS)

    def is_tab_active(self, locator):
        """Check if target tab class matches active sidebar styles."""
        element = self.find_element(locator)
        classes = element.get_attribute("class")
        return "active" in classes
