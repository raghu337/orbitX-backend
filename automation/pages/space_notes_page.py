from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class SpaceNotesPage(BasePage):
    """Encapsulates locators and behaviors for the Space Notes AI component."""

    # Locators
    SEARCH_INPUT = (By.CSS_SELECTOR, "input[placeholder*='Give notes about']")
    GENERATE_BUTTON = (By.CSS_SELECTOR, "form button[type='submit']")
    
    TAB_SHORT_NOTES = (By.XPATH, "//button[contains(text(), 'Short Notes')]")
    TAB_DETAILED_ANALYSIS = (By.XPATH, "//button[contains(text(), 'Detailed Analysis')]")
    TAB_PDF_SUMMARY = (By.XPATH, "//button[contains(text(), 'PDF Summary')]")
    TAB_STUDY_FLASHCARDS = (By.XPATH, "//button[contains(text(), 'Study Flashcards')]")
    
    TOPIC_TITLE = (By.XPATH, "//h3[contains(text(), 'Topic:')]")
    PRINT_BUTTON = (By.XPATH, "//button[contains(text(), 'Print')]")
    
    # Highlights / Short Notes
    HIGHLIGHTS_LIST = (By.CSS_SELECTOR, "ul li p")
    STATS_LABELS = (By.CSS_SELECTOR, "div.text-slate-400")
    STATS_VALUES = (By.CSS_SELECTOR, "div.text-2xl.font-black")
    
    # Detailed Analysis
    DETAILED_TITLE = (By.CSS_SELECTOR, "h4.text-lg.font-black")
    DETAILED_TEXT = (By.CSS_SELECTOR, "p.text-slate-300")
    
    # PDF Summary
    PDF_HEADER = (By.XPATH, "//h2[contains(text(), 'ORBITX AEROSPACE ACADEMY')]")
    PDF_REF_ID = (By.XPATH, "//*[contains(text(), 'DOCUMENT REF ID:')]")
    PDF_TABLE_ROWS = (By.CSS_SELECTOR, "table tbody tr")
    
    # Study Flashcards
    FLASHCARD_CONTAINER = (By.CSS_SELECTOR, ".perspective-1000")
    FLASHCARD_QUESTION = (By.CSS_SELECTOR, ".perspective-1000 p")
    FLASHCARD_REVEAL_PROMPT = (By.XPATH, "//*[contains(text(), 'Click Card to Reveal')]")
    FLASHCARD_VERIFIED_ANSWER = (By.XPATH, "//*[contains(text(), 'Verified Answer')]/../following-sibling::p | //*[contains(text(), 'Verified Answer')]/following-sibling::p")
    
    # Navigation arrows
    # The first w-12 button is left (prev), the second is right (next)
    PREV_CARD_BUTTON = (By.XPATH, "(//button[contains(@class, 'w-12') and contains(@class, 'h-12')])[1]")
    NEXT_CARD_BUTTON = (By.XPATH, "(//button[contains(@class, 'w-12') and contains(@class, 'h-12')])[2]")
    CARD_INDEX_LABEL = (By.XPATH, "//*[contains(text(), 'CARD ') and contains(text(), ' OF ')]")

    def search_topic(self, topic):
        """Type a search topic and click generate."""
        self.type(self.SEARCH_INPUT, topic)
        self.click(self.GENERATE_BUTTON)

    def select_short_notes_tab(self):
        self.click(self.TAB_SHORT_NOTES)

    def select_detailed_analysis_tab(self):
        self.click(self.TAB_DETAILED_ANALYSIS)

    def select_pdf_summary_tab(self):
        self.click(self.TAB_PDF_SUMMARY)

    def select_study_flashcards_tab(self):
        self.click(self.TAB_STUDY_FLASHCARDS)

    def get_topic_title(self):
        return self.get_text(self.TOPIC_TITLE)

    def get_highlights(self):
        """Return list of short note bullet point texts."""
        elements = self.driver.find_elements(*self.HIGHLIGHTS_LIST)
        return [el.text for el in elements if el.text]

    def get_stats(self):
        """Return a dict of stats labels mapped to values (e.g. {'AI CONFIDENCE': '99.8%'})"""
        labels = self.driver.find_elements(*self.STATS_LABELS)
        values = self.driver.find_elements(*self.STATS_VALUES)
        stats_dict = {}
        for l, v in zip(labels, values):
            stats_dict[l.text.strip()] = v.text.strip()
        return stats_dict

    def is_pdf_header_visible(self):
        return self.is_visible(self.PDF_HEADER)

    def get_pdf_ref_id(self):
        return self.get_text(self.PDF_REF_ID)

    def get_flashcard_question(self):
        return self.get_text(self.FLASHCARD_QUESTION)

    def flip_flashcard(self):
        self.click(self.FLASHCARD_CONTAINER)

    def click_next_card(self):
        self.click(self.NEXT_CARD_BUTTON)

    def click_prev_card(self):
        self.click(self.PREV_CARD_BUTTON)

    def get_card_index_text(self):
        return self.get_text(self.CARD_INDEX_LABEL)
