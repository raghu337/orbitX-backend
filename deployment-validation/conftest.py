import os
import http.server
import socketserver
import threading
import datetime
import pytest
from utils.config import ValidationConfig
from utils.logger import get_validation_logger
from utils.browser import ValidationBrowser
from utils.screenshots import ValidationScreenshot
from utils.report_generator import ValidationReporter

# Define directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MOCK_APP_DIR = os.path.join(os.path.dirname(BASE_DIR), "automation", "mock_app")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

logger = get_validation_logger("Conftest")
validation_results = []
session_start_time = None

env_details = {
    "target_url": ValidationConfig.TARGET_URL,
    "browser": "Chrome",
    "browser_version": "Headless",
    "os": "",
    "python_version": "",
    "selenium_version": "",
    "date": datetime.datetime.now().strftime("%Y-%m-%d"),
    "start_time": "",
    "end_time": "",
    "total_duration": ""
}

class MockAppHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler that serves files from the mock_app directory."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=MOCK_APP_DIR, **kwargs)
    def log_message(self, format, *args):
        pass

def start_mock_server():
    """Start the mock application server in a background thread."""
    handler = MockAppHandler
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", 8080), handler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    return httpd

@pytest.fixture(scope="session", autouse=True)
def mock_server():
    """Session fixture that manages the mock server lifetime if TARGET_URL is local."""
    if "127.0.0.1" in ValidationConfig.TARGET_URL or "localhost" in ValidationConfig.TARGET_URL:
        logger.info("Target URL is local. Launching mock application...")
        httpd = start_mock_server()
        yield
        logger.info("Shutting down mock application...")
        httpd.shutdown()
        httpd.server_close()
    else:
        yield

@pytest.fixture(scope="function")
def driver(request):
    """Fixture that initializes Chrome WebDriver and handles teardown."""
    logger.info("Initializing WebDriver session...")
    driver = ValidationBrowser.get_driver()
    
    # Store driver on the requesting node for access in pytest hooks
    if request.node:
        request.node.funcargs['driver'] = driver

    yield driver
    logger.info("Closing WebDriver session...")
    driver.quit()

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture screenshots on failure and collect test execution stats."""
    outcome = yield
    report = outcome.get_result()
    
    if report.when == "call" or (report.when == "setup" and report.skipped):
        duration = round(report.duration, 2)
        test_name = item.name
        module_name = item.module.__name__.split('.')[-1]
        description = item.obj.__doc__ or "No description provided"
        expected = "Passes deployment validation checks"
        
        status = "Pass"
        if report.failed:
            status = "Fail"
        elif report.skipped:
            status = "Skipped"
            
        actual = "Validation successful"
        screenshot_path = ""
        
        driver = item.funcargs.get("driver")
        if report.failed:
            actual = str(call.excinfo.value) if call.excinfo else "Assertion or connection timeout error"
            if driver:
                screenshot_path = ValidationScreenshot.capture(driver, test_name, os.path.join(REPORTS_DIR, "screenshots"))
                
        validation_results.append({
            "name": test_name,
            "module": module_name,
            "description": description.strip(),
            "expected": expected,
            "actual": actual.strip().split("\n")[0][:150],
            "status": status,
            "duration": f"{duration}s",
            "screenshot_path": screenshot_path
        })

def pytest_sessionstart(session):
    """Pytest hook triggered when testing session is initialized."""
    global session_start_time
    session_start_time = datetime.datetime.now()
    logger.info(f"Deployment validation session started at: {session_start_time}")

def pytest_sessionfinish(session, exitstatus):
    """Hook that compiles test results into reports at the end of the session."""
    global session_start_time
    end_time = datetime.datetime.now()
    duration_secs = (end_time - session_start_time).total_seconds() if session_start_time else 0
    logger.info(f"Deployment validation completed. Total duration: {duration_secs:.2f}s")
    
    # Collect system environment metadata
    import platform
    import sys
    import selenium
    
    env_details["os"] = platform.system()
    env_details["python_version"] = platform.python_version()
    env_details["selenium_version"] = selenium.__version__
    env_details["start_time"] = session_start_time.strftime("%H:%M:%S") if session_start_time else ""
    env_details["end_time"] = end_time.strftime("%H:%M:%S")
    env_details["total_duration"] = f"{duration_secs:.2f}s"
    
    # Generate the Excel and Markdown reports
    ValidationReporter.generate_excel_report(validation_results, env_details, REPORTS_DIR)
    ValidationReporter.generate_markdown_summary(validation_results, env_details, REPORTS_DIR)
