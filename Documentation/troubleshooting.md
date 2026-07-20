# OrbitX Troubleshooting Guide

This guide details resolutions to common issues encountered during setup, test execution, or deployment.

---

## 1. Selenium & Headless Chrome Execution Issues

### A. Chrome Crashes inside Docker Container
- **Symptoms**: Pytest output indicates `WebDriverException: Chrome failed to start: crashed` or `DevToolsActivePort file doesn't exist`.
- **Cause**: Chrome demands significant memory allocation which exceeds Docker's default `/dev/shm` capacity (64MB).
- **Solution**: Set the shared memory flag inside your Compose file, or pass the `--disable-dev-shm-usage` flag to Chrome Options.
  - In `docker-compose.yml`:
    ```yaml
    shm_size: 2gb
    ```
  - In `utils/browser.py`:
    ```python
    chrome_options.add_argument("--disable-dev-shm-usage")
    ```

### B. "chromedriver.exe" Executable Path Mismatch on Windows
- **Symptoms**: `FileNotFoundError` when launching the browser.
- **Cause**: `webdriver-manager` downloads binary packages into `.wdm` cache folder, which sometimes resolves files incorrectly under Windows paths.
- **Solution**: Implement fallback resolvers inside `utils/browser.py` to append `.exe` when running under Windows systems.

---

## 2. CI/CD & Pipeline Failures

### A. Gitleaks Fails on Commits History
- **Symptoms**: GitHub Actions DevSecOps workflow fails with exit code 1.
- **Cause**: Plaintext mock credentials (like `password123`) were added to commit histories.
- **Solution**:
  - Add specific exception rules to `.gitleaks.toml`.
  - Use environment variables instead of hardcoding credentials.

### B. CodeQL Security Alerts
- **Symptoms**: Alert indicates "Untrusted user input in SQL statement".
- **Cause**: Using raw string concats instead of SQLAlchemy parameterized bindings.
- **Solution**: Refactor database code to use parameters or context wrappers.

---

## 3. Local Server Failbacks

### A. API Telemetry Returns 404 / 500
- **Symptoms**: "Satellite Radar" widget shows connection failures.
- **Cause**: Firebase API limits or network outages.
- **Solution**: The frontend falls back automatically to local SQLite database endpoints. Ensure local backend is running (`uvicorn app.main:app`).
