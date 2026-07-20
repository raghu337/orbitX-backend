# Security Reports Output Directory

All automated scans (Gitleaks, Semgrep, Trivy, ZAP, Newman) save their JSON/HTML report assets here.

---

## Output Manifest

- `gitleaks-report.json`: JSON output of identified secrets.
- `semgrep-report.json`: SAST vulnerabilities findings.
- `trivy-report.json`: Dependency issues and licenses compliance status.
- `zap-baseline-report.html`: DAST passive scan HTML reports.
- `zap-full-report.html`: DAST active vulnerability findings.
- `newman-report.html` & `.json`: API functional security checks.
- `consolidated-scorecard.md`: Consolidated summary scorecard.
