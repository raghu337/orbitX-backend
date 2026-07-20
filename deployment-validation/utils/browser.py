import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager

class ValidationBrowser:
    """Configures and returns a headless WebDriver session for deployment testing."""
    
    @staticmethod
    def get_driver():
        browser_name = os.environ.get("BROWSER", "chrome").lower()
        
        if browser_name == "firefox":
            firefox_options = webdriver.FirefoxOptions()
            firefox_options.add_argument("--headless")
            firefox_options.add_argument("--window-size=1920,1080")
            try:
                driver = webdriver.Firefox(options=firefox_options)
            except Exception:
                service = FirefoxService(GeckoDriverManager().install())
                driver = webdriver.Firefox(service=service, options=firefox_options)
            return driver
            
        elif browser_name == "edge":
            edge_options = webdriver.EdgeOptions()
            edge_options.add_argument("--headless")
            edge_options.add_argument("--no-sandbox")
            edge_options.add_argument("--disable-dev-shm-usage")
            edge_options.add_argument("--window-size=1920,1080")
            # Set console logging prefs for Edge (Chromium based)
            edge_options.set_capability('ms:loggingPrefs', {'browser': 'ALL'})
            try:
                driver = webdriver.Edge(options=edge_options)
            except Exception:
                service = EdgeService(EdgeChromiumDriverManager().install())
                driver = webdriver.Edge(service=service, options=edge_options)
            return driver
            
        else:  # Default to chrome
            chrome_options = webdriver.ChromeOptions()
            chrome_options.add_argument("--headless=new")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--window-size=1920,1080")
            
            # Set capabilities to capture console logs from the browser
            chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
            
            try:
                driver = webdriver.Chrome(options=chrome_options)
            except Exception:
                driver_path = ChromeDriverManager().install()
                if os.name == 'nt' and not driver_path.lower().endswith(".exe"):
                    parent_dir = os.path.dirname(driver_path)
                    exe_path = os.path.join(parent_dir, "chromedriver.exe")
                    if os.path.exists(exe_path):
                        driver_path = exe_path
                service = ChromeService(driver_path)
                driver = webdriver.Chrome(service=service, options=chrome_options)
            return driver

