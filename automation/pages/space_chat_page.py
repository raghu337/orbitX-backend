from pages.base_page import BasePage
from selenium.webdriver.common.by import By


class SpaceChatPage(BasePage):
    """Encapsulates telemetry-guided AI chat interaction methods."""

    # Locators
    CHAT_INPUT = (By.CSS_SELECTOR, "form input[placeholder*='Ask OrbitX AI']")
    SEND_BUTTON = (By.CSS_SELECTOR, "form button[type='submit']")

    SUGGESTED_PROMPTS = (By.XPATH, "//button[.//span[contains(text(), 'Suggested Prompt')]]")

    MESSAGE_ROWS = (By.CSS_SELECTOR, "div.space-y-4 div.flex.gap-3")
    USER_MESSAGES = (By.XPATH, "//div[contains(@class, 'flex-row-reverse')]/div/div[contains(@class, 'bg-cyber-cyan')]")
    AI_MESSAGES = (By.XPATH, "//div[not(contains(@class, 'flex-row-reverse')) and contains(@class, 'gap-3')]/div/div[contains(@class, 'bg-white')]")

    TYPING_INDICATOR = (By.CSS_SELECTOR, "div.animate-pulse")

    def send_message(self, message):
        """Submit a custom message to the chat assistant."""
        self.type(self.CHAT_INPUT, message)
        self.click(self.SEND_BUTTON)

    def select_suggested_prompt_by_index(self, index):
        """Click one of the predefined prompt buttons."""
        prompts = self.driver.find_elements(*self.SUGGESTED_PROMPTS)
        if index < len(prompts):
            prompts[index].click()
        else:
            raise IndexError("Suggested prompt index out of bounds.")

    def get_suggested_prompts_texts(self):
        prompts = self.driver.find_elements(*self.SUGGESTED_PROMPTS)
        return [p.text for p in prompts if p.text]

    def get_chat_messages(self):
        """Get all messages text in chronological order."""
        messages = self.driver.find_elements(By.CSS_SELECTOR, "div.space-y-4 div.flex.gap-3 div div.p-4")
        return [m.text for m in messages if m.text]

    def get_user_messages(self):
        elements = self.driver.find_elements(*self.USER_MESSAGES)
        return [el.text for el in elements if el.text]

    def get_ai_messages(self):
        elements = self.driver.find_elements(*self.AI_MESSAGES)
        return [el.text for el in elements if el.text]

    def is_typing_indicator_visible(self):
        return self.is_visible(self.TYPING_INDICATOR)
