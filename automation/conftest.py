import os
import http.server
import socketserver
import threading
import datetime
import pytest
from utils.config import Config
from utils.logger import get_logger
from utils.driver_factory import DriverFactory
from utils.screenshot import ScreenshotUtility
from utils.excel_report import ExcelReporter

# Define directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MOCK_APP_DIR = os.path.join(BASE_DIR, "mock_app")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

# Logger instance
logger = get_logger("Conftest")

# Shared test results list for reporting
test_results_data = []

# Cached environment details
env_details_cache = {
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

session_start_time = None

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
    """Session fixture that manages the mock server lifetime if BASE_URL is default/local."""
    if "127.0.0.1" in Config.BASE_URL or "localhost" in Config.BASE_URL:
        logger.info("Starting local mock app server...")
        httpd = start_mock_server()
        yield
        logger.info("Stopping local mock app server...")
        httpd.shutdown()
        httpd.server_close()
    else:
        yield

@pytest.fixture(scope="function")
def driver(request):
    """Fixture that initializes Chrome WebDriver and handles teardown."""
    logger.info("Initializing WebDriver session...")
    driver = DriverFactory.get_driver()
    
    # Cache environment details dynamically
    env_details_cache["browser"] = driver.name.upper()
    env_details_cache["browser_version"] = driver.capabilities.get("browserVersion", "Headless")
    
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
    
    # Process when call finishes, or if it was skipped in setup phase
    if report.when == "call" or (report.when == "setup" and report.skipped):
        duration = round(report.duration, 2)
        test_name = item.name
        module_name = item.module.__name__.split('.')[-1]
        description = item.obj.__doc__ or "No description provided"
        expected = "Success / Passes Validation"
        
        status = "Pass"
        if report.failed:
            status = "Fail"
        elif report.skipped:
            status = "Skipped"
            
        actual = "Verification Passed"
        failure_reason = ""
        stack_trace = ""
        screenshot_path = ""
        
        driver = item.funcargs.get("driver")
        
        if report.failed:
            stack_trace = str(report.longrepr)
            failure_reason = str(call.excinfo.value) if call.excinfo else "AssertionError or Timeout"
            actual = failure_reason
            if driver:
                screenshot_path = ScreenshotUtility.capture(driver, test_name)
        
        # Save metrics to our reporting array
        test_results_data.append({
            "name": test_name,
            "module": module_name,
            "description": description.strip(),
            "expected": expected,
            "actual": actual.strip().split("\n")[0][:150],
            "status": status,
            "duration": f"{duration}s",
            "screenshot_path": screenshot_path,
            "failure_reason": failure_reason,
            "stack_trace": stack_trace,
            "suggested_fix": ExcelReporter.suggest_fix(test_name, stack_trace)
        })

def pytest_sessionstart(session):
    """Pytest hook triggered when testing session is initialized."""
    global session_start_time
    session_start_time = datetime.datetime.now()
    logger.info(f"Test Session Started at: {session_start_time}")

def pytest_sessionfinish(session, exitstatus):
    """Hook that compiles test results into reports at the end of the session."""
    global session_start_time
    end_time = datetime.datetime.now()
    duration_secs = (end_time - session_start_time).total_seconds() if session_start_time else 0
    logger.info(f"Test Session Completed. Total duration: {duration_secs:.2f}s")
    
    # Collect system environment metadata
    import platform
    import sys
    import selenium
    
    env_details_cache["os"] = platform.system()
    env_details_cache["python_version"] = platform.python_version()
    env_details_cache["selenium_version"] = selenium.__version__
    env_details_cache["start_time"] = session_start_time.strftime("%H:%M:%S") if session_start_time else ""
    env_details_cache["end_time"] = end_time.strftime("%H:%M:%S")
    env_details_cache["total_duration"] = f"{duration_secs:.2f}s"
    
    # Generate the Excel and Markdown reports
    ExcelReporter.generate_reports(test_results_data, env_details_cache, REPORTS_DIR)
