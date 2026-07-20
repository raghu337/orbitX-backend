# OrbitX Testing Guide

OrbitX features a robust quality assurance architecture split into two test suites: the **E2E Automation Suite (Selenium POM)** and the **Post-Deployment Verification Suite**.

---

## 1. Selenium Page Object Model (POM) Suite

Located under the `automation/` folder, this suite validates front-to-back user interactions using Chrome WebDriver and Pytest.

### Folder Layout
- `pages/`: Page Object classes (BasePage, LoginPage, DashboardPage, SpaceChatPage, LaunchHubPage).
- `tests/`: End-to-end test scenarios (e.g. `test_e2e_full.py`).
- `utils/`: Core helper utilities (driver factory, screenshot captures, Excel reporters).

### Running POM Tests
1. Install testing requirements:
   ```bash
   pip install -r automation/requirements.txt
   ```
2. Execute the test runner:
   ```bash
   pytest automation/tests/test_e2e_full.py
   ```

---

## 2. Post-Deployment Verification Suite

Located under the `deployment-validation/` directory, this suite conducts high-level smoke and regression testing against a live deployment target.

### Running Deployment Tests
To validate a live staging or production URL:
```bash
# Set target variables
export TARGET_URL="https://prod.orbitx.com"

# Run tests
pytest deployment-validation/
```

---

## 3. Interpreting Reports

Both suites generate visual and machine-readable execution reports under their respective `reports/` directory:

1. **HTML Report (`reports/report.html`)**: Interactive report detailing test logs, duration, status, and failure stack traces.
2. **Failure Screenshots (`reports/screenshots/`)**: Automated page state capture files saved whenever an assertion or element load fails.
3. **Excel Workbook (`reports/*.xlsx`)**: Styled spreadsheets listing pass/fail checklists, metadata execution configurations, and duration metrics.
4. **Markdown Summary (`reports/*.md`)**: High-level execution summaries.
