#!/usr/bin/env bash
# Cleanup script for temporary security outputs and cache files

set -euo pipefail

BASE_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$BASE_DIR")"
REPORTS_DIR="${PROJECT_ROOT}/reports"

echo "[Cleanup] Purging temporary security configurations and cache directories..."

# Remove local Trivy and Python caches
rm -rf "${PROJECT_ROOT}/sast/.trivy-cache"
rm -rf "${PROJECT_ROOT}/../.pytest_cache"
rm -rf "${PROJECT_ROOT}/../.semgrep_cache"

# Optional: Clean up compiled reports if requested
if [ "${1:-""}" == "--all" ]; then
    echo "[Cleanup] Removing all generated reports under: ${REPORTS_DIR}"
    rm -rf "${REPORTS_DIR}"/*
    # Keep the folder structure clean
    touch "${REPORTS_DIR}/.gitkeep"
fi

echo "[Cleanup] Done."
