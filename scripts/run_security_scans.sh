#!/usr/bin/env bash

# OrbitX DevSecOps Local Scan Runner (Unix)
# Exit immediately if a command exits with a non-zero status.
set -e

# Setup directories
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORTS_DIR="${WORKSPACE_DIR}/security-reports"
mkdir -p "${REPORTS_DIR}"

echo -e "\033[1;36m====================================================\033[0m"
echo -e "\033[1;36m       OrbitX Local Security & Quality Scanner      \033[0m"
echo -e "\033[1;36m====================================================\033[0m"
echo "Workspace: ${WORKSPACE_DIR}"
echo "Reports output: ${REPORTS_DIR}"
echo ""

# Helper to check command availability
is_installed() {
    command -v "$1" >/dev/null 2>&1
}

# ----------------------------------------------------
# 1. Gitleaks (Secret Scanning)
# ----------------------------------------------------
echo -e "\033[1;33m[1/5] Running Secrets Scan (Gitleaks)...\033[0m"
if is_installed gitleaks; then
    gitleaks detect --source="${WORKSPACE_DIR}" --config="${WORKSPACE_DIR}/.gitleaks.toml" --format=json --report-path="${REPORTS_DIR}/gitleaks-report.json" --redact --verbose || true
elif is_installed docker; then
    echo "Gitleaks not installed locally, running via Docker..."
    docker run --rm -v "${WORKSPACE_DIR}:/path" zricethezav/gitleaks:latest detect --source="/path" --config="/path/.gitleaks.toml" --format=json --report-path="/path/security-reports/gitleaks-report.json" --redact --verbose || true
else
    echo -e "\033[0;31mWARNING: Gitleaks is not installed locally and Docker is not running. Secrets scan skipped.\033[0m"
    echo "[]" > "${REPORTS_DIR}/gitleaks-report.json"
fi
echo ""

# ----------------------------------------------------
# 2. Semgrep (SAST / Code Quality)
# ----------------------------------------------------
echo -e "\033[1;33m[2/5] Running Static Analysis (Semgrep SAST)...\033[0m"
if is_installed semgrep; then
    semgrep scan --config auto --sarif --output "${REPORTS_DIR}/semgrep.sarif" || true
elif is_installed docker; then
    echo "Semgrep not installed locally, running via Docker..."
    docker run --rm -v "${WORKSPACE_DIR}:/src" returntocorp/semgrep semgrep scan --config auto --sarif --output "/src/security-reports/semgrep.sarif" || true
else
    echo -e "\033[0;31mWARNING: Semgrep is not installed. Code quality scan skipped.\033[0m"
    echo '{"runs": []}' > "${REPORTS_DIR}/semgrep.sarif"
fi
echo ""

# ----------------------------------------------------
# 3. Trivy (Config, Vulnerabilities, Licenses)
# ----------------------------------------------------
echo -e "\033[1;33m[3/5] Running Filesystem & License Auditing (Trivy)...\033[0m"
if is_installed trivy; then
    trivy fs "${WORKSPACE_DIR}" --format json --output "${REPORTS_DIR}/trivy-report.json" || true
    trivy fs "${WORKSPACE_DIR}" --scanners license --license-full --format json --output "${REPORTS_DIR}/trivy-license-report.json" || true
elif is_installed docker; then
    echo "Trivy not installed locally, running via Docker..."
    docker run --rm -v "${WORKSPACE_DIR}:/src" aquasec/trivy:latest fs "/src" --format json --output "/src/security-reports/trivy-report.json" || true
    docker run --rm -v "${WORKSPACE_DIR}:/src" aquasec/trivy:latest fs "/src" --scanners license --license-full --format json --output "/src/security-reports/trivy-license-report.json" || true
else
    echo -e "\033[0;31mWARNING: Trivy is not installed. Dependency and config scans skipped.\033[0m"
    echo '{"Results": []}' > "${REPORTS_DIR}/trivy-report.json"
    echo '{"Results": []}' > "${REPORTS_DIR}/trivy-license-report.json"
fi
echo ""

# ----------------------------------------------------
# 4. Dependency Audits (pip-audit & npm audit)
# ----------------------------------------------------
echo -e "\033[1;33m[4/5] Running Ecosystem dependency checks (pip-audit & npm audit)...\033[0m"
echo "# Dependency Audit Report" > "${REPORTS_DIR}/dependency-report.md"

# Python
if is_installed pip-audit; then
    echo "Running pip-audit on python projects..."
    echo -e "\n## Python dependency audit\n" >> "${REPORTS_DIR}/dependency-report.md"
    if [ -f "${WORKSPACE_DIR}/backend/requirements.txt" ]; then
        pip-audit -r "${WORKSPACE_DIR}/backend/requirements.txt" -f markdown >> "${REPORTS_DIR}/dependency-report.md" || true
    elif [ -f "${WORKSPACE_DIR}/requirements.txt" ]; then
        pip-audit -r "${WORKSPACE_DIR}/requirements.txt" -f markdown >> "${REPORTS_DIR}/dependency-report.md" || true
    fi
else
    echo "pip-audit not installed. Please run 'pip install pip-audit' to check python packages."
fi

# Node
if is_installed npm; then
    echo "Running npm audit..."
    echo -e "\n## Node.js dependency audit\n" >> "${REPORTS_DIR}/dependency-report.md"
    if [ -f "${WORKSPACE_DIR}/package.json" ]; then
        npm audit || true >> "${REPORTS_DIR}/dependency-report.md"
    fi
    if [ -f "${WORKSPACE_DIR}/orbitx-web/package.json" ]; then
        cd "${WORKSPACE_DIR}/orbitx-web"
        npm audit || true >> "${REPORTS_DIR}/dependency-report.md"
        cd "${WORKSPACE_DIR}"
    fi
else
    echo "npm not installed. Node package audit skipped."
fi
echo ""

# ----------------------------------------------------
# 5. Summary Generation
# ----------------------------------------------------
echo -e "\033[1;33m[5/5] Compiling execution summary...\033[0m"

# Simple parser to aggregate findings
python3 -c "
import os, json

gitleaks_findings = 0
trivy_vulns = 0
semgrep_findings = 0

gl_path = '${REPORTS_DIR}/gitleaks-report.json'
if os.path.exists(gl_path):
    try:
        with open(gl_path) as f:
            gitleaks_findings = len(json.load(f))
    except: pass
    
tv_path = '${REPORTS_DIR}/trivy-report.json'
if os.path.exists(tv_path):
    try:
        with open(tv_path) as f:
            data = json.load(f)
            for res in data.get('Results', []):
                trivy_vulns += len(res.get('Vulnerabilities', []))
    except: pass
    
sg_path = '${REPORTS_DIR}/semgrep.sarif'
if os.path.exists(sg_path):
    try:
        with open(sg_path) as f:
            sarif = json.load(f)
            for run in sarif.get('runs', []):
                semgrep_findings += len(run.get('results', []))
    except: pass
    
summary_content = f'''# Local Security Execution Summary

## Run Date: '$(date)'

| Scanner Tool | Scan Type | Findings Detected |
|---|---|---|
| **Gitleaks** | Secrets Scanning | {gitleaks_findings} |
| **Semgrep** | SAST Code Quality | {semgrep_findings} |
| **Trivy** | Dependency & Config | {trivy_vulns} |

### Action Items
1. {'Remediate credentials in gitleaks-report.json!' if gitleaks_findings > 0 else 'Secrets are clean.'}
2. {'Review dependency-report.md for outdated or vulnerable packages.' if trivy_vulns > 0 else 'All packages up-to-date.'}
3. {'Fix syntax and security issues flagged in semgrep.sarif.' if semgrep_findings > 0 else 'Code quality guidelines verified.'}
'''

with open('${REPORTS_DIR}/summary.md', 'w') as f:
    f.write(summary_content)
" || true

echo -e "\033[1;32m====================================================\033[0m"
echo -e "\033[1;32m   Local Scans Completed! Check security-reports/   \033[0m"
echo -e "\033[1;32m====================================================\033[0m"
