# OrbitX CI/CD Automation Scripts & Utilities

This directory contains scripts and configuration templates to execute builds, code checks, E2E tests, load testing, security audits, and consolidated pipeline reporting both locally and within GitHub Actions.

---

## 📂 Scripts Directory Layout

| Script File | Language | Purpose |
|---|---|---|
| [`build_backend.sh`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/scripts/build_backend.sh) | Bash | Auto-detects Python/FastAPI environment, installs packages, runs compilation checks, starts server, and verifies health status. |
| [`discover_apis.py`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/scripts/discover_apis.py) | Python | Inspects endpoints registered on FastAPI router dynamically and exports an inventory table (`reports/api-inventory.md`). |
| [`generate_badge.py`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/scripts/generate_badge.py) | Python | Parses coverage reports (`coverage.xml`) to output a visual SVG code coverage status badge (`reports/coverage.svg`). |
| [`load_test.js`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/scripts/load_test.js) | JS (k6) | Performance scenarios configuring load stages (up to 500 VUs) targeting FastAPI endpoints. |
| [`parse_k6.py`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/scripts/parse_k6.py) | Python | Parses output from k6 JSON summary to generate a markdown performance benchmark report including p95 and p99 response times. |
| [`compile_security_reports.py`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/scripts/compile_security_reports.py) | Python | Merges SAST outputs (Semgrep, CodeQL) and SCA reports (Trivy, pip-audit, npm-audit) into centralized vulnerability tables. |
| [`aggregate_reports.py`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/scripts/aggregate_reports.py) | Python | Consolidates all test suite results, copies matrix output assets (HTML, Excel), builds the HTML Premium Dashboard, and calculates the overall pipeline status. |
| [`run_security_scans.sh`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/scripts/run_security_scans.sh) | Bash | Helper shell script to execute Gitleaks, Semgrep, and Trivy filesystem audits in a single command on Unix environments. |
| [`run_security_scans.ps1`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/scripts/run_security_scans.ps1) | PowerShell | Helper script to run security tool audits locally on Windows systems. |

---

## 🛠️ Running Tasks Locally

### 1. Build Verification
```bash
./scripts/build_backend.sh
```

### 2. Run Pytest Suites
```bash
# Run unit tests with coverage
pytest backend/tests/ --cov=backend/app --cov-report=xml:reports/coverage.xml --cov-report=html:reports/coverage-report.html --junitxml=reports/junit-unit.xml

# Run API Integration tests
pytest backend/tests/api_tests/ --junitxml=reports/junit-api-pytest.xml
```

### 3. Generate Reports & Dashboard
After completing tests, execute these compilation scripts sequentially to build the dashboard:
```bash
# Extract coverage & generate SVG badge
python scripts/generate_badge.py

# Compile security scanning findings
python scripts/compile_security_reports.py

# Generate overall dashboard.html and executive summaries
python scripts/aggregate_reports.py
```
View the premium telemetry dashboard by opening [`reports/dashboard.html`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/reports/dashboard.html) in your browser.
