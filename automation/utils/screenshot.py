import os


class ScreenshotUtility:
    """Manages failure image recordings during test runs."""

    @staticmethod
    def capture(driver, test_name):
        """Take screenshot and save to reports/screenshots/ folder."""
        if not driver:
            return None

        reports_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        screenshots_dir = os.path.join(reports_dir, "reports", "screenshots")
        os.makedirs(screenshots_dir, exist_ok=True)

        filename = f"{test_name}.png"
        filepath = os.path.join(screenshots_dir, filename)

        try:
            driver.save_screenshot(filepath)
            return filepath
        except Exception:
            return None
