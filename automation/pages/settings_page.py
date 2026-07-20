from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class SettingsPage(BasePage):
    """Encapsulates system configuration options in Settings panel."""

    # Locators
    TELEMETRY_TOGGLE = (By.XPATH, "//h4[contains(text(), 'Real-Time Satellite Feed')]/parent::div/following-sibling::button")
    LATENCY_SLIDER = (By.XPATH, "//label[contains(text(), 'Latency Threshold')]/following-sibling::div/input")
    LATENCY_VALUE = (By.XPATH, "//label[contains(text(), 'Latency Threshold')]/following-sibling::div/span")
    
    COGNITIVE_MODEL_PRO = (By.XPATH, "//button[contains(text(), 'Pro')]")
    COGNITIVE_MODEL_FLASH = (By.XPATH, "//button[contains(text(), 'Flash')]")
    COGNITIVE_MODEL_HYBRID = (By.XPATH, "//button[contains(text(), 'Hybrid-AI')]")
    
    CONFIDENCE_SLIDER = (By.XPATH, "//label[contains(text(), 'Confidence Filter')]/parent::div/following-sibling::input")
    CONFIDENCE_VALUE = (By.XPATH, "//label[contains(text(), 'Confidence Filter')]/following-sibling::span")
    
    THEME_COSMIC_DARK = (By.XPATH, "//button[contains(text(), 'Cosmic Dark')]")
    THEME_DEEP_AURORA = (By.XPATH, "//button[contains(text(), 'Deep Aurora')]")
    THEME_SOLAR_ECLIPSE = (By.XPATH, "//button[contains(text(), 'Solar Eclipse')]")
    
    DIAGNOSTICS_ROWS = (By.CSS_SELECTOR, "div.font-mono div")

    def toggle_telemetry(self):
        self.click(self.TELEMETRY_TOGGLE)

    def is_telemetry_active(self):
        """Check if telemetry toggle has the active/cyan class style applied."""
        el = self.find_element(self.TELEMETRY_TOGGLE)
        cls = el.get_attribute("class")
        return "bg-cyber-cyan" in cls

    def set_latency_threshold(self, value):
        self.set_range_value(self.LATENCY_SLIDER, value)

    def get_latency_value_text(self):
        return self.get_text(self.LATENCY_VALUE)

    def select_model_pro(self):
        self.click(self.COGNITIVE_MODEL_PRO)

    def select_model_flash(self):
        self.click(self.COGNITIVE_MODEL_FLASH)

    def select_model_hybrid(self):
        self.click(self.COGNITIVE_MODEL_HYBRID)

    def get_selected_model_class(self, model_locator):
        el = self.find_element(model_locator)
        return el.get_attribute("class")

    def set_confidence_filter(self, value):
        self.set_range_value(self.CONFIDENCE_SLIDER, value)

    def get_confidence_value_text(self):
        return self.get_text(self.CONFIDENCE_VALUE)

    def select_theme_cosmic_dark(self):
        self.click(self.THEME_COSMIC_DARK)

    def select_theme_deep_aurora(self):
        self.click(self.THEME_DEEP_AURORA)

    def select_theme_solar_eclipse(self):
        self.click(self.THEME_SOLAR_ECLIPSE)

    def get_diagnostics_logs(self):
        elements = self.driver.find_elements(*self.DIAGNOSTICS_ROWS)
        return [el.text for el in elements if el.text]
