# OrbitX Automated Security Testing Toolkit

This toolkit provides reusable scanners, configurations, and automated testing scripts to perform Static Application Security Testing (SAST), Software Composition Analysis (SCA), API testing, and Dynamic Application Security Testing (DAST) on the OrbitX application.

---

## 1. Directory Structure

```
security-toolkit/
├── sast/                   # SAST & SCA scanning profiles
│   ├── semgrep.yml         # Custom rules for SQLi and CORS checks
│   ├── codeql-config.yml   # CodeQL query configurations
│   ├── trivy-config.yaml   # Trivy dependency scanner configs
│   └── gitleaks.toml       # Git secret scanning rules
│
├── dast/                   # Dynamic runtime analysis
│   ├── zap-baseline.sh     # Passive HTTP headers scan script
│   ├── zap-full-scan.sh    # Active vulnerability scan script
│   └── api-scan.sh         # Scans backend Swagger/OpenAPI spec
│
├── api-tests/              # Newman/Postman API tests
│   ├── postman_collection.json
│   ├── environment.json
│   └── newman_runner.sh
│
├── configs/                # Global runtime configurations
│   ├── security-config.yaml
│   └── report-config.yaml
│
├── scripts/                # Execution & compilation helpers
│   ├── run_all_scans.sh    # Main CLI scan runner
│   ├── generate_report.py  # Scorecard Markdown compiler
│   └── cleanup.sh          # Cache and temp cleaner
│
└── reports/                # Security output artifacts
```

---

## 2. Quickstart Execution Guide

To run all security evaluations and generate a unified report locally:

### Step 1: Install Scanner Clients
Ensure you have the required scanners installed in your terminal:
- **Trivy**: `brew install aquasecurity/trivy/trivy` (macOS) or download binary.
- **Semgrep**: `pip install semgrep`
- **Gitleaks**: `brew install gitleaks`
- **Newman**: `npm install -g newman`
- **Docker**: Needed for ZAP baseline DAST scans.

### Step 2: Trigger the Suite
Navigate to the scripts folder and run the master script:
```bash
cd security-toolkit/scripts
./run_all_scans.sh
```

---

## 3. Unified Scorecard Outputs
On completion, the python compiler generates a consolidated report under `reports/consolidated-scorecard.md`:

```markdown
# OrbitX Automated Security Assessment Scorecard

**Execution Date**: 2026-07-20 09:30:00
**Target Scope**: Backend Gateway & Web Portal Client

---

## 1. Scanner Results

| Security Vector | Tool / Scanner | Assessment / Finding | Status |
|---|---|---|---|
| **Secret Leakage** | Gitleaks | 0 secrets detected | ✅ Clear |
| **Static Code Analysis (SAST)** | Semgrep | 0 code issues identified | ✅ Clear |
| **Software Composition (SCA)** | Trivy | 0 dependency issues identified | ✅ Clear |
| **API Compliance & Logic** | Newman | 0 of 4 API assertions failed | ✅ Clear |
```

---

## 4. Integration in GitHub Actions CI/CD

Integrate these scans into your CI/CD pipelines to block insecure builds:

```yaml
name: Security Scan Stage
on: [push, pull_request]

jobs:
  sast-scans:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          config-path: security-toolkit/sast/gitleaks.toml

      - name: Run Semgrep
        run: |
          pip install semgrep
          semgrep scan --config security-toolkit/sast/semgrep.yml --fail-on-severity ERROR
```
