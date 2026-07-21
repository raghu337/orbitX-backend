import unittest

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By


class TestOrbitXWebAuth(unittest.TestCase):
    """
    E2E Selenium Test Suite for Web Build Navigation & Authentication.
    Tests user login form inputs, toggle states, and error dialogues in the browser.
    """

    def setUp(self):
        options = Options()
        options.add_argument("--headless")  # Run headless for CI integration
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")

        # Note: Local WebDriver configuration required
        try:
            self.driver = webdriver.Chrome(options=options)
            self.driver.implicitly_wait(5)
        except Exception:
            print("[Selenium SETUP WARNING]: ChromeDriver not found on local path. Running in simulation mode.")
            self.driver = None

    def tearDown(self):
        if self.driver:
            self.driver.quit()

    def test_web_login_form_layout(self):
        """TEST-006: Verify Login Screen layout rendering in web browser"""
        if not self.driver:
            self.skipTest("No ChromeDriver environment active.")

        # Navigate to Expo web server running port
        self.driver.get("http://localhost:8081/login")

        # Assert input fields display
        email_el = self.driver.find_element(By.CSS_SELECTOR, "input[type='email']")
        pass_el = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        btn_el = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

        self.assertTrue(email_el.is_displayed())
        self.assertTrue(pass_el.is_displayed())
        self.assertTrue(btn_el.is_displayed())

    def test_web_invalid_email_warning(self):
        """TEST-008: Verify alert triggers on malformed email input"""
        if not self.driver:
            self.skipTest("No ChromeDriver environment active.")

        self.driver.get("http://localhost:8081/login")

        email_el = self.driver.find_element(By.CSS_SELECTOR, "input[type='email']")
        btn_el = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

        email_el.send_keys("invalid_email")
        btn_el.click()

        error_box = self.driver.find_element(By.CLASS_NAME, "validation-error-box")
        self.assertIn("Please include an '@' in the email address", error_box.text)

if __name__ == "__main__":
    unittest.main()
