from pages.base_page import BasePage
from selenium.webdriver.common.by import By


class NavigationPage(BasePage):
    """Encapsulates sidebar navigation actions."""

    NAV_SPACE_NOTES = (By.ID, "nav-space-notes")
    NAV_SATELLITE_RADAR = (By.ID, "nav-satellite-radar")
    NAV_PLANET_EXPLORER = (By.ID, "nav-planet-explorer")

    def click_space_notes(self):
        self.click(self.NAV_SPACE_NOTES)

    def click_satellite_radar(self):
        self.click(self.NAV_SATELLITE_RADAR)

    def click_planet_explorer(self):
        self.click(self.NAV_PLANET_EXPLORER)

    def is_tab_active(self, tab_locator):
        """Verify tab has .active class applied."""
        element = self.find_element(tab_locator)
        classes = element.get_attribute("class")
        return "active" in classes
