# E2E Test Execution Guide & Troubleshooting Manual

This document provides setup instructions for Windows, macOS, and Linux, along with solutions for common Selenium and GitHub Actions troubleshooting cases.

---

## Multi-OS Setup Instructions

### 1. Windows Setup
1. **Python**: Ensure Python 3.11+ is installed. Add Python to your system PATH.
2. **Chrome**: Verify Google Chrome is installed on the local system.
3. **Execution**:
   ```powershell
   # Install dependencies
   pip install -r Automation/requirements.txt
   
   # Run tests
   pytest
   ```

### 2. macOS Setup
1. **Python**: Install Python using Homebrew:
   ```bash
   brew install python@3.11
   ```
2. **Chrome**: Verify Chrome is in the Applications folder.
3. **Execution**:
   ```bash
   pip3 install -r Automation/requirements.txt
   pytest
   ```

### 3. Linux (Ubuntu / Debian) Setup
1. **Python**: Install Python and pip:
   ```bash
   sudo apt-get update
   sudo apt-get install -y python3 python3-pip
   ```
2. **Chrome**: Install stable headless Chrome packages:
   ```bash
   wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
   sudo apt install ./google-chrome-stable_current_amd64.deb
   ```
3. **Execution**:
   ```bash
   pip3 install -r Automation/requirements.txt
   pytest
   ```

---

## Troubleshooting Manual

### 1. Browser/Driver Incompatibility
- **Symptom**: `SessionNotCreatedException: Message: session not created: This version of ChromeDriver only supports Chrome version...`
- **Resolution**: We use Selenium 4's native **Selenium Manager**, which automatically resolves matching driver releases in the background. Ensure your Google Chrome is updated to the latest stable version. Avoid hardcoding driver binary paths.

### 2. Headless execution issues in CI/CD
- **Symptom**: `WebDriverException: Message: unknown error: Chrome failed to start: crashed`
- **Resolution**: Headless runners lack display buffers. Ensure Chrome options contain these flags in `conftest.py`:
  ```python
  chrome_options.add_argument("--headless=new")
  chrome_options.add_argument("--no-sandbox")
  chrome_options.add_argument("--disable-dev-shm-usage")
  ```

### 3. Elements Render Asynchronously (Wait issues)
- **Symptom**: `NoSuchElementException` or `TimeoutException` when fetching active tabs.
- **Resolution**: Replace raw assertions on static driver finds with BasePage's explicit wait utilities:
  ```python
  # Correct way using explicit waits
  element = self.find_element(locator, timeout=10)
  ```
