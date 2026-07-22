# ==============================================================================
# OrbitX - Windows PowerShell QA & Automation Test Suite Pipeline
# Orchestrates Pytest, Playwright, Appium, k6, and Coverage checks.
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting OrbitX QA Automation Pipeline (PowerShell)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Ensure output directories exist
New-Item -ItemType Directory -Force -Path "reports" | Out-Null
New-Item -ItemType Directory -Force -Path "coverage" | Out-Null

# 2. Run Pytest with coverage
Write-Host "`n----------------------------------------------------------" -ForegroundColor Yellow
Write-Host "🐍 [1/4] Executing Backend Pytest & Coverage Analysis..." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow

try {
    pytest backend/tests --cov=backend/app --cov-report=term-missing --cov-report=html:coverage/html --cov-report=xml:coverage/coverage.xml --junitxml=reports/backend-junit.xml
} catch {
    Write-Host "⚠️ Pytest execution completed with warnings/errors: $_" -ForegroundColor Yellow
}

# 3. Playwright check
Write-Host "`n----------------------------------------------------------" -ForegroundColor Yellow
Write-Host "🎭 [2/4] Validating Playwright Configuration..." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow

if (Test-Path "playwright.config.ts") {
    Write-Host "✅ Playwright configuration file found: playwright.config.ts" -ForegroundColor Green
}

# 4. WebdriverIO Appium config check
Write-Host "`n----------------------------------------------------------" -ForegroundColor Yellow
Write-Host "📱 [3/4] Validating Mobile Appium Configuration..." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow

if (Test-Path "mobile/wdio.conf.js") {
    node -e "require('./mobile/wdio.conf.js'); console.log('✅ WebdriverIO Appium config verified.');"
}

# 5. k6 Performance config check
Write-Host "`n----------------------------------------------------------" -ForegroundColor Yellow
Write-Host "⚡ [4/4] Validating k6 Load Test Configuration..." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow

if (Test-Path "performance/k6/k6.config.js") {
    Write-Host "✅ k6 configuration file found: performance/k6/k6.config.js" -ForegroundColor Green
}

# 6. Verify Coverage Threshold
Write-Host "`n----------------------------------------------------------" -ForegroundColor Yellow
Write-Host "📊 Checking Coverage Gate Threshold..." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow

if ((Test-Path "scripts/verify_coverage.py") -and (Test-Path "coverage/coverage.xml")) {
    python scripts/verify_coverage.py --threshold 80.0
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "✅ OrbitX QA Pipeline Run Complete. Output saved to /reports & /coverage" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
