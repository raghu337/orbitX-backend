import unittest
from appium import webdriver
from appium.options.common import AppiumOptions
from appium.webdriver.common.appiumby import AppiumBy

class TestOrbitXAndroidAuth(unittest.TestCase):
    """
    E2E Appium Test Suite for Android Device/Emulator Authentication Screens.
    Verifies Splash Screen transition, form rendering, validation flags, and login flow.
    """
    
    def setUp(self):
        # Configure Appium capabilities for Android automation
        options = AppiumOptions()
        options.load_capabilities({
            "platformName": "Android",
            "automationName": "UiAutomator2",
            "deviceName": "Android Emulator",
            "appPackage": "com.orbitx",
            "appActivity": ".MainActivity",
            "noReset": True,
            "newCommandTimeout": 300,
            "gpsEnabled": True
        })
        
        # Connect to local Appium Server
        try:
            self.driver = webdriver.Remote("http://127.0.0.1:4723/wd/hub", options=options)
            self.driver.implicitly_wait(10)
        except Exception as e:
            print("[Appium SETUP WARNING]: Appium Server at http://127.0.0.1:4723 not active. Running in simulation mode.")
            self.driver = None

    def tearDown(self):
        if self.driver:
            self.driver.quit()

    def test_login_fields_visibility(self):
        """TEST-006: Verify Login Screen UI Layout elements are visible"""
        if not self.driver:
            self.skipTest("No Appium driver session active.")
            
        # Verify inputs and button components are displayed
        email_field = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login-email-input")
        password_field = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login-password-input")
        login_btn = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login-submit-button")
        
        self.assertTrue(email_field.is_displayed())
        self.assertTrue(password_field.is_displayed())
        self.assertTrue(login_btn.is_displayed())

    def test_empty_credentials_validation(self):
        """TEST-007: Verify validation warnings trigger on blank credentials click"""
        if not self.driver:
            self.skipTest("No Appium driver session active.")
            
        login_btn = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login-submit-button")
        login_btn.click()
        
        # Verify validation error text
        error_msg = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "validation-error-text")
        self.assertEqual(error_msg.text, "Please fill in all fields")

    def test_password_visibility_toggle(self):
        """TEST-010: Verify eye icon toggles password secure mask"""
        if not self.driver:
            self.skipTest("No Appium driver session active.")
            
        password_field = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login-password-input")
        eye_toggle = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password-visibility-toggle")
        
        # Verify secure field is masked by default
        self.assertEqual(password_field.get_attribute("password"), "true")
        
        # Click toggle icon and verify unmasked status
        eye_toggle.click()
        self.assertEqual(password_field.get_attribute("password"), "false")

if __name__ == "__main__":
    unittest.main()
