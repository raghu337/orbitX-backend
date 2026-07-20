import os
import datetime

class ValidationScreenshot:
    """Helper to capture screenshots on test failure."""
    
    @staticmethod
    def capture(driver, test_name, output_dir="reports/screenshots"):
        """Save a PNG screenshot of the current page."""
        try:
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
                
            timestamp = datetime.datetime.now().strftime("%H%M%S")
            filename = f"fail_{test_name}_{timestamp}.png"
            filepath = os.path.join(output_dir, filename)
            
            driver.save_screenshot(filepath)
            return filepath
        except Exception as e:
            print(f"Failed to capture screenshot: {str(e)}")
            return ""
