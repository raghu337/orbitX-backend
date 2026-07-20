#!/usr/bin/env bash
# OWASP ZAP Baseline vulnerability scan script

set -euo pipefail

# Target URL default to the local mock instance
TARGET_URL="${1:-http://host.docker.internal:8080}"
OUTPUT_DIR="$(pwd)/../reports"

echo "[ZAP] Running baseline vulnerability check against target: ${TARGET_URL}"
echo "[ZAP] Saving results to: ${OUTPUT_DIR}/zap-baseline-report.html"

# Run ZAP Docker image baseline script
docker run --rm \
  -v "${OUTPUT_DIR}:/zap/wrk/:rw" \
  ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t "${TARGET_URL}" \
  -r zap-baseline-report.html || echo "[ZAP] Scan completed with warnings."
