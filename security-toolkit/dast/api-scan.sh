#!/usr/bin/env bash
# OWASP ZAP API vulnerability script (scans Swagger/OpenAPI specifications)

set -euo pipefail

# Target API default to local backend openapi schema url
API_SPEC_URL="${1:-http://host.docker.internal:8000/openapi.json}"
OUTPUT_DIR="$(pwd)/../reports"

echo "[ZAP] Scanning API specification endpoint: ${API_SPEC_URL}"
echo "[ZAP] Saving results to: ${OUTPUT_DIR}/zap-api-report.html"

# Run ZAP Docker image API scanner script
docker run --rm \
  -v "${OUTPUT_DIR}:/zap/wrk/:rw" \
  ghcr.io/zaproxy/zaproxy:stable zap-api-scan.py \
  -t "${API_SPEC_URL}" \
  -f openapi \
  -r zap-api-report.html || echo "[ZAP] Scan finished."
