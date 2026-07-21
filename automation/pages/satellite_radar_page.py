from pages.base_page import BasePage
from selenium.webdriver.common.by import By


class SatelliteRadarPage(BasePage):
    """Encapsulates locators and behaviors for the Satellite Radar component."""

    # Locators
    MUTE_BUTTON = (By.XPATH, "//button[contains(@class, 'cursor-pointer') and .//*[local-name()='svg']] | //button[@id='mute-radar-btn']")
    DOWNLINK_LATENCY = (By.XPATH, "//*[contains(text(), 'Downlink Latency:')]")

    DENSITY_SLIDER = (By.XPATH, "//span[contains(text(), 'Constellation Density')]/parent::div/following-sibling::input")
    DENSITY_VALUE = (By.XPATH, "//span[contains(text(), 'Constellation Density')]/following-sibling::span")

    ALTITUDE_SLIDER = (By.XPATH, "//span[contains(text(), 'Orbital Altitude')]/parent::div/following-sibling::input")
    ALTITUDE_VALUE = (By.XPATH, "//span[contains(text(), 'Orbital Altitude')]/following-sibling::span")

    CANVAS_MAP = (By.CSS_SELECTOR, "canvas.cursor-crosshair")

    # Proximity Defense HUD
    WARNING_LEVEL = (By.XPATH, "//*[contains(text(), 'Warning Level') or contains(text(), 'WARNING LEVEL')]/following-sibling::div")
    DISTANCE_TO_BASE = (By.XPATH, "//*[contains(text(), 'Distance to Base')]/following-sibling::span")
    APPROACH_BEARING = (By.XPATH, "//*[contains(text(), 'Approach bearing')]/following-sibling::span")

    # Live Vessel Telemetry
    NORAD_IDENT = (By.XPATH, "//*[contains(text(), 'NORAD Ident')]/following-sibling::span")
    VELOCITY_VECTOR = (By.XPATH, "//*[contains(text(), 'Velocity vector')]/following-sibling::span")
    ORBITAL_ALTITUDE = (By.XPATH, "//*[contains(text(), 'Orbital altitude')]/following-sibling::span")
    CLASSIFICATION = (By.XPATH, "//*[contains(text(), 'Classification')]/following-sibling::span")

    # Fleet Table
    FLEET_ROWS = (By.XPATH, "//h3[contains(text(), 'Fleet')]/../descendant::tbody/tr")

    def toggle_mute(self):
        self.click(self.MUTE_BUTTON)

    def is_muted(self):
        """Check if mute icon is VolumeX (muted state) or Volume2 (unmuted)."""
        el = self.find_element(self.MUTE_BUTTON)
        svg = el.find_element(By.XPATH, ".//*[local-name()='svg']")
        cls = svg.get_attribute("class") or ""
        return "volume-x" in cls.lower() or "volumex" in cls.lower()

    def get_latency_text(self):
        return self.get_text(self.DOWNLINK_LATENCY)

    def set_constellation_density(self, value):
        self.set_range_value(self.DENSITY_SLIDER, value)

    def get_constellation_density_text(self):
        return self.get_text(self.DENSITY_VALUE)

    def set_orbital_altitude(self, value):
        self.set_range_value(self.ALTITUDE_SLIDER, value)

    def get_orbital_altitude_text(self):
        return self.get_text(self.ALTITUDE_VALUE)

    def get_warning_level_text(self):
        return self.get_text(self.WARNING_LEVEL)

    def get_distance_to_base_text(self):
        return self.get_text(self.DISTANCE_TO_BASE)

    def get_norad_ident_text(self):
        return self.get_text(self.NORAD_IDENT)

    def get_velocity_vector_text(self):
        return self.get_text(self.VELOCITY_VECTOR)

    def get_fleet_rows_count(self):
        return len(self.driver.find_elements(*self.FLEET_ROWS))

    def click_fleet_row(self, index):
        rows = self.driver.find_elements(*self.FLEET_ROWS)
        if index < len(rows):
            rows[index].click()
        else:
            raise IndexError("Fleet table row index out of bounds.")
