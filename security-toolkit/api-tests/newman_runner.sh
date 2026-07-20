#!/usr/bin/env bash
# Newman API automation collection runner script

set -euo pipefail

BASE_DIR="$(dirname "$0")"
REPORTS_DIR="${BASE_DIR}/../reports"

echo "[Newman] Starting API automated collections validation..."

# Check if newman command is installed
if ! command -v newman &> /dev/null; then
    echo "[Newman] Error: newman-cli is not installed. Run: npm install -g newman"
    exit 1
fi

# Run the collection
newman run "${BASE_DIR}/postman_collection.json" \
  -e "${BASE_DIR}/environment.json" \
  --reporters cli,json,html \
  --reporter-json-export "${REPORTS_DIR}/newman-report.json" \
  --reporter-html-export "${REPORTS_DIR}/newman-report.html"

echo "[Newman] Execution finished successfully. Reports generated."
