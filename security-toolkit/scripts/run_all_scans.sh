#!/usr/bin/env bash
# OrbitX Security Testing Toolkit - Orchestration Script

set -uo pipefail

BASE_DIR="$(dirname "$(readlink -f "$0")")"
PROJECT_ROOT="$(dirname "$BASE_DIR")"
REPORTS_DIR="${PROJECT_ROOT}/reports"
mkdir -p "${REPORTS_DIR}"

echo "============================================="
echo " OrbitX Security Testing Orchestrator"
echo "============================================="
echo "Starting security evaluations..."
echo "Reports directory: ${REPORTS_DIR}"

# 1. RUN SECRET SCANNING (Gitleaks)
echo -e "\n[1/5] Initiating Secrets Scan..."
if command -v gitleaks &> /dev/null; then
    gitleaks detect --source="${PROJECT_ROOT}/../" \
      --config="${PROJECT_ROOT}/sast/gitleaks.toml" \
      --report-path="${REPORTS_DIR}/gitleaks-report.json" || echo "[-] Gitleaks finished with findings."
else
    echo "[!] Gitleaks binary not found. Skipping secrets scan."
fi

# 2. RUN STATIC CODE ANALYSIS (Semgrep)
echo -e "\n[2/5] Initiating Semgrep Scan..."
if command -v semgrep &> /dev/null; then
    semgrep scan --config="${PROJECT_ROOT}/sast/semgrep.yml" \
      --json --output="${REPORTS_DIR}/semgrep-report.json" "${PROJECT_ROOT}/../" || echo "[-] Semgrep finished with findings."
else
    echo "[!] Semgrep CLI not found. Skipping SAST scan."
fi

# 3. RUN SOFTWARE COMPOSITION ANALYSIS (Trivy)
echo -e "\n[3/5] Initiating Dependency & License Scan..."
if command -v trivy &> /dev/null; then
    trivy fs --config "${PROJECT_ROOT}/sast/trivy-config.yaml" \
      "${PROJECT_ROOT}/../" || echo "[-] Trivy finished with findings."
else
    echo "[!] Trivy CLI not found. Skipping SCA scan."
fi

# 4. RUN DAST (OWASP ZAP Baseline)
echo -e "\n[4/5] Initiating DAST Baseline Scan..."
if command -v docker &> /dev/null; then
    # Start ZAP baseline script
    bash "${PROJECT_ROOT}/dast/zap-baseline.sh" "http://host.docker.internal:8080"
else
    echo "[!] Docker not found. Skipping ZAP DAST scan."
fi

# 5. RUN API FUNCTIONAL SECURITY (Newman)
echo -e "\n[5/5] Initiating Newman API tests..."
if command -v newman &> /dev/null; then
    bash "${PROJECT_ROOT}/api-tests/newman_runner.sh"
else
    echo "[!] Newman CLI not found. Skipping API collection verification."
fi

# 6. COMPILE SECURITY SCORECARD REPORT
echo -e "\nGenerating consolidated scorecard..."
if command -v python3 &> /dev/null; then
    python3 "${BASE_DIR}/generate_report.py"
elif command -v python &> /dev/null; then
    python "${BASE_DIR}/generate_report.py"
else
    echo "[!] Python not found. Skipping scorecard aggregation."
fi

echo -e "\n============================================="
echo " OrbitX Security Testing Complete"
echo "============================================="
