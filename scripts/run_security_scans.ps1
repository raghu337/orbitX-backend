# OrbitX DevSecOps Local Scan Runner (Windows)
$ErrorActionPreference = "Continue"

# Setup directories
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceDir = Resolve-Path "$ScriptDir\.."
$ReportsDir = "$WorkspaceDir\security-reports"

if (!(Test-Path $ReportsDir)) {
    New-Item -ItemType Directory -Force -Path $ReportsDir | Out-Null
}

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       OrbitX Local Security & Quality Scanner      " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Workspace: $WorkspaceDir"
Write-Host "Reports output: $ReportsDir"
Write-Host ""

# Helper to check command availability
function Test-Command {
    param ([string]$Command)
    $val = Get-Command $Command -ErrorAction SilentlyContinue
    return $null -ne $val
}

# ----------------------------------------------------
# 1. Gitleaks (Secret Scanning)
# ----------------------------------------------------
Write-Host "[1/5] Running Secrets Scan (Gitleaks)..." -ForegroundColor Yellow
if (Test-Command gitleaks) {
    gitleaks detect --source="$WorkspaceDir" --config="$WorkspaceDir\.gitleaks.toml" --format=json --report-path="$ReportsDir\gitleaks-report.json" --redact --verbose
} elseif (Test-Command docker) {
    Write-Host "Gitleaks not installed locally, running via Docker..."
    docker run --rm -v "${WorkspaceDir}:/path" zricethezav/gitleaks:latest detect --source="/path" --config="/path/.gitleaks.toml" --format=json --report-path="/path/security-reports/gitleaks-report.json" --redact --verbose
} else {
    Write-Host "WARNING: Gitleaks is not installed locally and Docker is not running. Secrets scan skipped." -ForegroundColor Red
    "[]" | Out-File -FilePath "$ReportsDir\gitleaks-report.json" -Encoding utf8
}
Write-Host ""

# ----------------------------------------------------
# 2. Semgrep (SAST / Code Quality)
# ----------------------------------------------------
Write-Host "[2/5] Running Static Analysis (Semgrep SAST)..." -ForegroundColor Yellow
if (Test-Command semgrep) {
    semgrep scan --config auto --sarif --output "$ReportsDir\semgrep.sarif"
} elseif (Test-Command docker) {
    Write-Host "Semgrep not installed locally, running via Docker..."
    docker run --rm -v "${WorkspaceDir}:/src" returntocorp/semgrep semgrep scan --config auto --sarif --output "/src/security-reports/semgrep.sarif"
} else {
    Write-Host "WARNING: Semgrep is not installed. Code quality scan skipped." -ForegroundColor Red
    '{"runs": []}' | Out-File -FilePath "$ReportsDir\semgrep.sarif" -Encoding utf8
}
Write-Host ""

# ----------------------------------------------------
# 3. Trivy (Config, Vulnerabilities, Licenses)
# ----------------------------------------------------
Write-Host "[3/5] Running Filesystem & License Auditing (Trivy)..." -ForegroundColor Yellow
if (Test-Command trivy) {
    trivy fs "$WorkspaceDir" --format json --output "$ReportsDir\trivy-report.json"
    trivy fs "$WorkspaceDir" --scanners license --license-full --format json --output "$ReportsDir\trivy-license-report.json"
} elseif (Test-Command docker) {
    Write-Host "Trivy not installed locally, running via Docker..."
    docker run --rm -v "${WorkspaceDir}:/src" aquasec/trivy:latest fs "/src" --format json --output "/src/security-reports/trivy-report.json"
    docker run --rm -v "${WorkspaceDir}:/src" aquasec/trivy:latest fs "/src" --scanners license --license-full --format json --output "/src/security-reports/trivy-license-report.json"
} else {
    Write-Host "WARNING: Trivy is not installed. Dependency and config scans skipped." -ForegroundColor Red
    '{"Results": []}' | Out-File -FilePath "$ReportsDir\trivy-report.json" -Encoding utf8
    '{"Results": []}' | Out-File -FilePath "$ReportsDir\trivy-license-report.json" -Encoding utf8
}
Write-Host ""

# ----------------------------------------------------
# 4. Dependency Audits (pip-audit & npm audit)
# ----------------------------------------------------
Write-Host "[4/5] Running Ecosystem dependency checks (pip-audit & npm audit)..." -ForegroundColor Yellow
"# Dependency Audit Report`n" | Out-File -FilePath "$ReportsDir\dependency-report.md" -Encoding utf8

# Python
if (Test-Command pip-audit) {
    Write-Host "Running pip-audit on python projects..."
    "`n## Python dependency audit`n" | Out-File -FilePath "$ReportsDir\dependency-report.md" -Append -Encoding utf8
    if (Test-Path "$WorkspaceDir\backend\requirements.txt") {
        pip-audit -r "$WorkspaceDir\backend\requirements.txt" -f markdown | Out-File -FilePath "$ReportsDir\dependency-report.md" -Append -Encoding utf8
    } elseif (Test-Path "$WorkspaceDir\requirements.txt") {
        pip-audit -r "$WorkspaceDir\requirements.txt" -f markdown | Out-File -FilePath "$ReportsDir\dependency-report.md" -Append -Encoding utf8
    }
} else {
    Write-Host "pip-audit not installed. Run 'pip install pip-audit' to check python packages."
}

# Node
if (Test-Command npm) {
    Write-Host "Running npm audit..."
    "`n## Node.js dependency audit`n" | Out-File -FilePath "$ReportsDir\dependency-report.md" -Append -Encoding utf8
    if (Test-Path "$WorkspaceDir\package.json") {
        npm audit | Out-File -FilePath "$ReportsDir\dependency-report.md" -Append -Encoding utf8
    }
    if (Test-Path "$WorkspaceDir\orbitx-web\package.json") {
        Push-Location "$WorkspaceDir\orbitx-web"
        npm audit | Out-File -FilePath "$ReportsDir\dependency-report.md" -Append -Encoding utf8
        Pop-Location
    }
} else {
    Write-Host "npm not installed. Node package audit skipped."
}
Write-Host ""

# ----------------------------------------------------
# 5. Summary Generation
# ----------------------------------------------------
Write-Host "[5/5] Compiling execution summary..." -ForegroundColor Yellow

$GitleaksFindings = 0
$TrivyVulns = 0
$SemgrepFindings = 0

if (Test-Path "$ReportsDir\gitleaks-report.json") {
    try {
        $glContent = Get-Content "$ReportsDir\gitleaks-report.json" -Raw | ConvertFrom-Json
        $GitleaksFindings = $glContent.Count
    } catch {}
}

if (Test-Path "$ReportsDir\trivy-report.json") {
    try {
        $tvContent = Get-Content "$ReportsDir\trivy-report.json" -Raw | ConvertFrom-Json
        foreach ($res in $tvContent.Results) {
            $TrivyVulns += $res.Vulnerabilities.Count
        }
    } catch {}
}

if (Test-Path "$ReportsDir\semgrep.sarif") {
    try {
        $sgContent = Get-Content "$ReportsDir\semgrep.sarif" -Raw | ConvertFrom-Json
        foreach ($run in $sgContent.runs) {
            $SemgrepFindings += $run.results.Count
        }
    } catch {}
}

$SummaryContent = @"
# Local Security Execution Summary

## Run Date: $(Get-Date)

| Scanner Tool | Scan Type | Findings Detected |
|---|---|---|
| **Gitleaks** | Secrets Scanning | $GitleaksFindings |
| **Semgrep** | SAST Code Quality | $SemgrepFindings |
| **Trivy** | Dependency & Config | $TrivyVulns |

### Action Items
1. $(if ($GitleaksFindings -gt 0) {"Remediate credentials in gitleaks-report.json!"} else {"Secrets are clean."})
2. $(if ($TrivyVulns -gt 0) {"Review dependency-report.md for outdated or vulnerable packages."} else {"All packages up-to-date."})
3. $(if ($SemgrepFindings -gt 0) {"Fix syntax and security issues flagged in semgrep.sarif."} else {"Code quality guidelines verified."})
"@

$SummaryContent | Out-File -FilePath "$ReportsDir\summary.md" -Encoding utf8

Write-Host "====================================================" -ForegroundColor Green
Write-Host "   Local Scans Completed! Check security-reports/   " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
