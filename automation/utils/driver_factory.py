from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class DriverFactory:
    """Factory to spin up configured webdriver instances."""
    
    @staticmethod
    def get_driver():
        """Configure and return a headless Chrome driver session using webdriver-manager."""
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        
        import os
        driver_path = ChromeDriverManager().install()
        if not driver_path.lower().endswith(".exe"):
            parent_dir = os.path.dirname(driver_path)
            exe_path = os.path.join(parent_dir, "chromedriver.exe")
            if os.path.exists(exe_path):
                driver_path = exe_path
        
        service = Service(driver_path)
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
