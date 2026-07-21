from pages.base_page import BasePage
from selenium.webdriver.common.by import By


class LaunchHubPage(BasePage):
    """Encapsulates the scheduler interface for upcoming spacecraft launches."""

    # Locators
    MISSION_CARDS = (By.CSS_SELECTOR, "div.grid-cols-1 > div.glass-panel, div.grid > div.glass-panel")

    MISSION_NAMES = (By.CSS_SELECTOR, "div.glass-panel h3")
    AGENCY_TAGS = (By.XPATH, "//div[contains(@class, 'glass-panel')]//span[contains(@class, 'tracking-widest') and not(contains(@class, 'rounded-full'))]")
    STATUS_TAGS = (By.XPATH, "//div[contains(@class, 'glass-panel')]//span[contains(@class, 'rounded-full')]")

    ROCKET_NAMES = (By.XPATH, "//div[contains(@class, 'glass-panel')]//*[contains(text(), 'Booster')]/following-sibling::span | //div[contains(@class, 'glass-panel')]//*[contains(text(), 'Booster')]/span")
    LOCATION_NAMES = (By.XPATH, "//div[contains(@class, 'glass-panel')]//svg[contains(@class, 'lucide-map-pin')]/following-sibling::span")

    STREAM_LINKS = (By.XPATH, "//div[contains(@class, 'glass-panel')]//a[contains(text(), 'Watch stream')]")
    COUNTDOWN_TIMER_CELLS = (By.CSS_SELECTOR, "div.font-mono div.bg-black\\/40")

    def get_mission_count(self):
        return len(self.driver.find_elements(*self.MISSION_CARDS))

    def get_mission_names(self):
        elements = self.driver.find_elements(*self.MISSION_NAMES)
        return [el.text.strip() for el in elements if el.text]

    def get_agency_tags(self):
        elements = self.driver.find_elements(*self.AGENCY_TAGS)
        return [el.text.strip() for el in elements if el.text]

    def get_status_tags(self):
        elements = self.driver.find_elements(*self.STATUS_TAGS)
        return [el.text.strip() for el in elements if el.text]

    def get_rocket_names(self):
        elements = self.driver.find_elements(*self.ROCKET_NAMES)
        return [el.text.strip() for el in elements if el.text]

    def get_location_names(self):
        elements = self.driver.find_elements(*self.LOCATION_NAMES)
        return [el.text.strip() for el in elements if el.text]

    def get_stream_urls(self):
        elements = self.driver.find_elements(*self.STREAM_LINKS)
        return [el.get_attribute("href") for el in elements]

    def get_countdown_timer_data(self, mission_index):
        """Return a dict representation of T-Minus countdown cells, e.g. {'DAYS': '02', 'HRS': '04'}"""
        # Each mission has 4 countdown cells (DAYS, HRS, MINS, SECS)
        cards = self.driver.find_elements(*self.MISSION_CARDS)
        if mission_index >= len(cards):
            raise IndexError("Mission card index out of bounds.")

        cells = cards[mission_index].find_elements(By.CSS_SELECTOR, "div.font-mono > div")
        data = {}
        for cell in cells:
            val_el = cell.find_element(By.CSS_SELECTOR, "div:first-child")
            lbl_el = cell.find_element(By.CSS_SELECTOR, "div:last-child")
            data[lbl_el.text.strip()] = val_el.text.strip()
        return data
