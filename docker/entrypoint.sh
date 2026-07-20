#!/usr/bin/env bash
# OrbitX Selenium Automation Docker Entrypoint

# Exit immediately if a command exits with a non-zero status
set -e

# Bridge general environment variables to framework config variables
if [ -n "$USERNAME" ]; then
    export ORBITX_USERNAME="$USERNAME"
fi

if [ -n "$PASSWORD" ]; then
    export ORBITX_PASSWORD="$PASSWORD"
fi

# Ensure reports directory exists
mkdir -p /app/reports

echo "=========================================================="
echo " Starting OrbitX Selenium Automation Suite in Docker"
echo "=========================================================="
echo " Target Base URL: ${BASE_URL:-http://127.0.0.1:8080}"
echo " User Account:    ${ORBITX_USERNAME:-astronaut@orbitx.com}"
echo "=========================================================="
echo ""

# Run pytest inside the container
# "$@" allows passing extra args to docker run (e.g. docker run container -k test_name)
pytest tests/test_e2e_full.py -v --html=reports/report.html --self-contained-html "$@"
