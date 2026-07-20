import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class ValidationBrowser:
    """Configures and returns a headless Chrome driver session for deployment testing."""
    
    @staticmethod
    def get_driver():
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        
        # Set capabilities to capture console logs from the browser
        chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
        
        # Download and install ChromeDriver
        driver_path = ChromeDriverManager().install()
        
        # Fallback logic for Windows systems if ChromeDriverManager resolves a non-exe file
        if os.name == 'nt' and not driver_path.lower().endswith(".exe"):
            parent_dir = os.path.dirname(driver_path)
            exe_path = os.path.join(parent_dir, "chromedriver.exe")
            if os.path.exists(exe_path):
                driver_path = exe_path
        
        service = Service(driver_path)
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
