# OrbitX E2E Selenium UI Automation Framework

This directory houses the Selenium WebDriver Page Object Model (POM) testing framework for validating the authentication, navigation, and session persistence behaviors of the OrbitX workspace.

---

## Project Structure

```text
automation/
├── mock_app/            # Local hermetic HTML test application
│   ├── login.html
│   └── dashboard.html
├── pages/               # Page Object Model (POM) classes
│   ├── base_page.py     # Base wait/click/type actions
│   ├── login_page.py    # Login locators and actions
│   ├── dashboard_page.py# Profile card and panel state assertions
│   └── navigation_page.py# Sidebar navigation controls
├── reports/             # Test execution outputs (Screenshots, HTML, Excel)
│   ├── screenshots/     # Screenshots captured automatically on failures
│   └── test-results.xlsx# Formatted Excel run log
├── tests/               # Pytest test cases
│   └── test_ui_flows.py # The 9 main E2E test scenarios
├── conftest.py          # Pytest setup, daemon test server, and driver lifecycle hooks
├── pytest.ini           # Pytest running parameters
└── requirements.txt     # Python dependency configuration
```

---

## Local Setup & Execution

### 1. Prerequisites
- Python 3.11+
- Google Chrome browser installed

### 2. Installation
Install testing framework dependencies:
```powershell
pip install -r requirements.txt
```

### 3. Run All Tests
Execute tests using the root or local configuration:
```powershell
pytest
```
*Note: Chrome will run in headless mode by default. Tests will spin up a local server on `http://127.0.0.1:8080` to emulate authentication flows.*

### 4. Running Against a Live Application
To run E2E scenarios against a deployed website instead of the mock application:
```powershell
# Set target base URL and credentials in shell environment
$env:BASE_URL="https://your-orbitx-deployment.com"
$env:ORBITX_USERNAME="your-user@orbitx.com"
$env:ORBITX_PASSWORD="secure-password123"

# Run tests
pytest
```

---

## GitHub Actions CI Integration

The workspace includes a pre-configured GitHub Actions workflow located at `.github/workflows/selenium-e2e.yml`.

### How It Works
1. **Trigger**: Triggers on `push` or `pull_request` to `main`/`master`, or manually via `workflow_dispatch`.
2. **Environment**: Runs on `ubuntu-latest`, installs Python 3.11, Google Chrome stable, and dependencies.
3. **Execution**: Reads Secrets for target environment parameters and runs pytest in headless mode.
4. **Reports**: Compiles the standard HTML report, JUnit annotations, Excel log, and screenshot failures.
5. **Artifacts**: Uploads reports under the artifact name `test-reports-and-results`.

### Setting Up GitHub Secrets
To configure environment variables for the GitHub Actions pipeline, navigate to your repository's **Settings > Secrets and variables > Actions** and add the following secrets:

| Secret Name | Description | Example Value |
| :--- | :--- | :--- |
| `BASE_URL` | Destination URL of the web app (Optional; defaults to mock server) | `https://dev.orbitx.org` |
| `USERNAME` | Authenticated user email to pass validation test cases | `astronaut@orbitx.com` |
| `PASSWORD` | Target password associated with the test username | `password123` |
