#!/usr/bin/env python3
# Aggregates outputs from separate tool JSON outputs into a Markdown scorecard.

import os
import json
import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPORTS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "reports")
OUTPUT_FILE = os.path.join(REPORTS_DIR, "consolidated-scorecard.md")

def parse_gitleaks():
    path = os.path.join(REPORTS_DIR, "gitleaks-report.json")
    if not os.path.exists(path):
        return "N/A (Scan skipped or failed)"
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return f"{len(data)} secrets detected"
            return "0 secrets detected"
    except Exception as e:
        return f"Error parsing Gitleaks: {str(e)}"

def parse_semgrep():
    path = os.path.join(REPORTS_DIR, "semgrep-report.json")
    if not os.path.exists(path):
        return "N/A (Scan skipped or failed)"
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            findings = data.get("results", [])
            return f"{len(findings)} code issues identified"
    except Exception as e:
        return f"Error parsing Semgrep: {str(e)}"

def parse_trivy():
    path = os.path.join(REPORTS_DIR, "trivy-report.json")
    if not os.path.exists(path):
        return "N/A (Scan skipped or failed)"
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            findings_count = 0
            results = data.get("Results", [])
            for r in results:
                findings_count += len(r.get("Vulnerabilities", []))
            return f"{findings_count} dependency issues identified"
    except Exception as e:
        return f"Error parsing Trivy: {str(e)}"

def parse_newman():
    path = os.path.join(REPORTS_DIR, "newman-report.json")
    if not os.path.exists(path):
        return "N/A (Scan skipped or failed)"
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            stats = data.get("run", {}).get("stats", {})
            assertions = stats.get("assertions", {})
            failed = assertions.get("failed", 0)
            total = assertions.get("total", 0)
            return f"{failed} of {total} API assertions failed"
    except Exception as e:
        return f"Error parsing Newman: {str(e)}"

def main():
    print("[Aggregator] Generating consolidated scorecard...")
    
    gitleaks_summary = parse_gitleaks()
    semgrep_summary = parse_semgrep()
    trivy_summary = parse_trivy()
    newman_summary = parse_newman()
    
    # Check ZAP files
    zap_baseline = "Present" if os.path.exists(os.path.join(REPORTS_DIR, "zap-baseline-report.html")) else "Missing"
    zap_full = "Present" if os.path.exists(os.path.join(REPORTS_DIR, "zap-full-report.html")) else "Missing"
    
    md_content = f"""# OrbitX Automated Security Assessment Scorecard

**Execution Date**: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Target Scope**: Backend Gateway & Web Portal Client

---

## 1. Scanner Results

| Security Vector | Tool / Scanner | Assessment / Finding | Status |
|---|---|---|---|
| **Secret Leakage** | Gitleaks | {gitleaks_summary} | {"⚠️ Action Required" if "secrets" in gitleaks_summary and "0" not in gitleaks_summary else "✅ Clear"} |
| **Static Code Analysis (SAST)** | Semgrep | {semgrep_summary} | {"⚠️ Action Required" if "0 code" not in semgrep_summary and "N/A" not in semgrep_summary else "✅ Clear"} |
| **Software Composition (SCA)** | Trivy | {trivy_summary} | {"⚠️ Action Required" if "0 dependency" not in trivy_summary and "N/A" not in trivy_summary else "✅ Clear"} |
| **API Compliance & Logic** | Newman | {newman_summary} | {"⚠️ Action Required" if "failed" in newman_summary and "0 of" not in newman_summary else "✅ Clear"} |

---

## 2. Dynamic Vulnerability Reports (DAST)
- **ZAP Baseline Scan HTML**: `{zap_baseline}` (reports/zap-baseline-report.html)
- **ZAP Full Scan HTML**: `{zap_full}` (reports/zap-full-report.html)
"""
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(md_content)
        
    print(f"[Aggregator] Report saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
