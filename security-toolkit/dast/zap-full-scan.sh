#!/usr/bin/env bash
# OWASP ZAP Full Scan vulnerability script

set -euo pipefail

# Target URL default to the local mock instance
TARGET_URL="${1:-http://host.docker.internal:8080}"
OUTPUT_DIR="$(pwd)/../reports"

echo "[ZAP] Running deep active vulnerability scan against target: ${TARGET_URL}"
echo "[ZAP] Saving results to: ${OUTPUT_DIR}/zap-full-report.html"

# Run ZAP Docker image full active scanner script
docker run --rm \
  -v "${OUTPUT_DIR}:/zap/wrk/:rw" \
  ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py \
  -t "${TARGET_URL}" \
  -r zap-full-report.html || echo "[ZAP] Scan finished."
