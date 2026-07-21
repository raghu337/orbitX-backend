#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OrbitX Enterprise Security Report Compiler
=========================================
Reads findings from Semgrep, CodeQL, Bandit, pip-audit, Safety, Trivy, Gitleaks,
Dependency Review, and Secret Scan, aggregating them into a unified report.
Generates:
  - reports/security.json
  - reports/security.html
  - reports/security.md
  - reports/security-report.md (for backward compatibility)
"""

import os
import sys
import json
from datetime import datetime

# Force UTF-8 stdout/stderr encoding on Windows
if sys.platform.startswith("win") and getattr(sys.stdout, "encoding", "").lower() != "utf-8":
    try:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")
    except Exception:
        pass

# Ensure reports directory exists
os.makedirs("reports", exist_ok=True)

# ---------------------------------------------------------------------------
# Parsers & Helpers
# ---------------------------------------------------------------------------
def read_json(path):
    if not os.path.exists(path):
        return {}
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Security Compiler] Warning: Could not parse JSON at {path}: {e}")
        return {}

def sarif_finding_count(path):
    """Counts results in a SARIF file (used by Semgrep and CodeQL)."""
    data = read_json(path)
    if not data:
        return 0
    count = 0
    for run in data.get("runs", []):
        count += len(run.get("results", []))
    return count

def sarif_severity_counts(path):
    """Extracts severity details from SARIF."""
    data = read_json(path)
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    if not data:
        return counts
    for run in data.get("runs", []):
        for result in run.get("results", []):
            level = result.get("level", "warning").lower()
            if level == "error":
                counts["high"] += 1
            elif level == "warning":
                counts["medium"] += 1
            else:
                counts["low"] += 1
    return counts

def bandit_counts(path):
    data = read_json(path)
    counts = {"high": 0, "medium": 0, "low": 0}
    results = data.get("results", [])
    for r in results:
        sev = r.get("issue_severity", "LOW").lower()
        if sev in counts:
            counts[sev] += 1
    return counts

def safety_counts(path):
    data = read_json(path)
    if not data:
        return 0
    if isinstance(data, list):
        return len(data)
    return len(data.get("vulnerabilities", []))

def gitleaks_counts(path):
    data = read_json(path)
    if isinstance(data, list):
        return len(data)
    return 0

def trivy_counts(path):
    data = read_json(path)
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    results = data.get("Results", []) or data.get("results", [])
    for r in results:
        for vuln in r.get("Vulnerabilities", []) or []:
            sev = vuln.get("Severity", "").lower()
            if sev in counts:
                counts[sev] += 1
    return counts

# ---------------------------------------------------------------------------
# Main Execution
# ---------------------------------------------------------------------------
def main():
    print("[Security Compiler] 🛡️ Starting OrbitX security report compilation...")
    
    # ── 1. Gather Scanner Findings ──
    # Semgrep
    semgrep_findings = sarif_finding_count("reports/semgrep.sarif")
    semgrep_sev = sarif_severity_counts("reports/semgrep.sarif")
    
    # CodeQL
    codeql_findings = sarif_finding_count("reports/codeql-results.sarif")
    codeql_sev = sarif_severity_counts("reports/codeql-results.sarif")
    
    # Bandit
    bandit_data = bandit_counts("reports/bandit-report.json")
    bandit_findings = sum(bandit_data.values())
    
    # pip-audit
    pip_audit_data = read_json("reports/pip-audit-report.json")
    pip_audit_findings = len(pip_audit_data.get("dependencies", [])) if isinstance(pip_audit_data, dict) else len(pip_audit_data)
    
    # Safety
    safety_findings = safety_counts("reports/safety-report.json")
    
    # Trivy
    trivy_fs_sev = trivy_counts("reports/trivy-report.json")
    trivy_docker_sev = trivy_counts("reports/docker-backend-trivy.json")
    trivy_findings = sum(trivy_fs_sev.values()) + sum(trivy_docker_sev.values())
    trivy_combined_sev = {
        "critical": trivy_fs_sev["critical"] + trivy_docker_sev["critical"],
        "high": trivy_fs_sev["high"] + trivy_docker_sev["high"],
        "medium": trivy_fs_sev["medium"] + trivy_docker_sev["medium"],
        "low": trivy_fs_sev["low"] + trivy_docker_sev["low"]
    }
    
    # Gitleaks
    gitleaks_findings = gitleaks_counts("reports/gitleaks-report.json")
    
    # Dependency Review
    dep_review_data = read_json("reports/dependency-review-report.json")
    dep_review_findings = len(dep_review_data) if isinstance(dep_review_data, list) else 0

    # Secret Scan
    secret_scan_data = read_json("reports/secret-scan-report.json")
    secret_scan_findings = len(secret_scan_data) if isinstance(secret_scan_data, list) else 0

    # ── 2. Build Structured Security Object ──
    scanners = [
        {
            "name": "Semgrep",
            "category": "SAST",
            "findings": semgrep_findings,
            "sev": {"critical": 0, "high": semgrep_sev["high"], "medium": semgrep_sev["medium"], "low": semgrep_sev["low"]},
            "status": "🟢 PASS" if semgrep_findings == 0 else ("🟡 WARN" if semgrep_findings <= 3 else "🔴 FAIL")
        },
        {
            "name": "CodeQL",
            "category": "SAST",
            "findings": codeql_findings,
            "sev": {"critical": codeql_sev["critical"], "high": codeql_sev["high"], "medium": codeql_sev["medium"], "low": codeql_sev["low"]},
            "status": "🟢 PASS" if codeql_findings == 0 else "🔴 FAIL"
        },
        {
            "name": "Bandit",
            "category": "SAST",
            "findings": bandit_findings,
            "sev": {"critical": 0, "high": bandit_data["high"], "medium": bandit_data["medium"], "low": bandit_data["low"]},
            "status": "🟢 PASS" if bandit_findings == 0 else ("🟡 WARN" if bandit_data["high"] == 0 else "🔴 FAIL")
        },
        {
            "name": "pip-audit",
            "category": "SCA",
            "findings": pip_audit_findings,
            "sev": {"critical": 0, "high": pip_audit_findings, "medium": 0, "low": 0},
            "status": "🟢 PASS" if pip_audit_findings == 0 else "🔴 FAIL"
        },
        {
            "name": "Safety",
            "category": "SCA",
            "findings": safety_findings,
            "sev": {"critical": 0, "high": safety_findings, "medium": 0, "low": 0},
            "status": "🟢 PASS" if safety_findings == 0 else "🔴 FAIL"
        },
        {
            "name": "Trivy",
            "category": "SCA",
            "findings": trivy_findings,
            "sev": trivy_combined_sev,
            "status": "🟢 PASS" if trivy_combined_sev["critical"] + trivy_combined_sev["high"] == 0 else "🔴 FAIL"
        },
        {
            "name": "Gitleaks",
            "category": "Secrets",
            "findings": gitleaks_findings,
            "sev": {"critical": gitleaks_findings, "high": 0, "medium": 0, "low": 0},
            "status": "🟢 PASS" if gitleaks_findings == 0 else "🔴 FAIL"
        },
        {
            "name": "Dependency Review",
            "category": "SCA",
            "findings": dep_review_findings,
            "sev": {"critical": 0, "high": dep_review_findings, "medium": 0, "low": 0},
            "status": "🟢 PASS" if dep_review_findings == 0 else "🔴 FAIL"
        },
        {
            "name": "Secret Scan",
            "category": "Secrets",
            "findings": secret_scan_findings,
            "sev": {"critical": secret_scan_findings, "high": 0, "medium": 0, "low": 0},
            "status": "🟢 PASS" if secret_scan_findings == 0 else "🔴 FAIL"
        }
    ]

    total_findings = sum(s["findings"] for s in scanners)
    failed_scans = sum(1 for s in scanners if s["status"] == "🔴 FAIL")
    overall_status = "🟢 PASS" if failed_scans == 0 else "🔴 FAIL"
    
    score = 100
    for s in scanners:
        if s["status"] == "🔴 FAIL":
            score -= 10
        elif s["status"] == "🟡 WARN":
            score -= 4
    score = max(0, score)

    # ── 3. Calculate Severity Totals for Charting ──
    crit_total = sum(s["sev"].get("critical", 0) for s in scanners)
    high_total = sum(s["sev"].get("high", 0) for s in scanners)
    med_total = sum(s["sev"].get("medium", 0) for s in scanners)
    low_total = sum(s["sev"].get("low", 0) for s in scanners)

    max_sev = max(1, crit_total, high_total, med_total, low_total)
    crit_height = int((crit_total / max_sev) * 120)
    high_height = int((high_total / max_sev) * 120)
    med_height = int((med_total / max_sev) * 120)
    low_height = int((low_total / max_sev) * 120)

    # Save security.json
    result = {
        "status": overall_status,
        "score": score,
        "scanners": scanners,
        "summary": {
            "total": len(scanners),
            "passed": sum(1 for s in scanners if s["status"].startswith("🟢")),
            "warning": sum(1 for s in scanners if s["status"].startswith("🟡")),
            "failed": failed_scans,
            "findings_count": total_findings,
            "severities": {
                "critical": crit_total,
                "high": high_total,
                "medium": med_total,
                "low": low_total
            }
        }
    }
    with open("reports/security.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    # ── 4. Generate Markdown reports ──
    scanner_rows = []
    for s in scanners:
        scanner_rows.append(f"| {s['name']} | {s['category']} | {s['findings']} | {s['status']} |")

    sev_rows = []
    for s in scanners:
        sev_rows.append(f"| {s['name']} | {s['sev'].get('critical',0)} | {s['sev'].get('high',0)} | {s['sev'].get('medium',0)} | {s['sev'].get('low',0)} |")

    # Generate Markdown progress bar/chart helper
    def md_bar(val):
        filled = int((val / max_sev) * 20) if max_sev > 0 else 0
        return "█" * filled + "░" * (20 - filled)

    recommendations = [
        "- **Upgrade Outdated Packages**: Remediate dependency flaws identified in `pip-audit` and `Safety` audits.",
        "- **Address SAST Findings**: Fix code vulnerabilities flagged by `Semgrep` and `Bandit` engines.",
        "- **Audit Secrets**: Use Git Filter-Repo to scrub secrets history if any entries were flagged by `Gitleaks` or `Secret Scan`."
    ]

    md_content = f"""# 🛡️ OrbitX Enterprise Security Assessment

> **Overall Risk Status: {overall_status}**
> **Security Grade Score: {score}/100**
> **Total Vulnerability Findings: {total_findings}**

---

## 📊 Summary Table

| Scanner Engine | Category | Findings | Status |
| :--- | :--- | :---: | :---: |
{chr(10).join(scanner_rows)}

---

## 📈 Severity Table

| Scanner Engine | Critical | High | Medium | Low |
| :--- | :---: | :---: | :---: | :---: |
{chr(10).join(sev_rows)}

---

## 📊 Vulnerability Severity Distribution Chart

- **Critical**: `[{md_bar(crit_total)}]` ({crit_total})
- **High**:     `[{md_bar(high_total)}]` ({high_total})
- **Medium**:   `[{md_bar(med_total)}]` ({med_total})
- **Low**:      `[{md_bar(low_total)}]` ({low_total})

---

## 💡 Remediation Recommendations

{chr(10).join(recommendations)}

---
*Generated by OrbitX Enterprise Security Compiler*
"""
    with open("reports/security.md", "w", encoding="utf-8") as f:
        f.write(md_content)
    with open("reports/security-report.md", "w", encoding="utf-8") as f:
        f.write(md_content)

    # ── 5. Generate HTML Report ──
    html_scanner_rows = ""
    for s in scanners:
        badge_cls = "badge-green" if s["status"].startswith("🟢") else ("badge-yellow" if s["status"].startswith("🟡") else "badge-red")
        html_scanner_rows += f"""
        <tr>
          <td><strong>{s['name']}</strong></td>
          <td>{s['category']}</td>
          <td style="color: { 'var(--text)' if s['findings'] == 0 else 'var(--red)' }; font-weight: 600;">{s['findings']}</td>
          <td><span class="badge {badge_cls}">{s['status']}</span></td>
        </tr>
        """

    html_sev_rows = ""
    for s in scanners:
        html_sev_rows += f"""
        <tr>
          <td><strong>{s['name']}</strong></td>
          <td>{s['sev'].get('critical', 0)}</td>
          <td>{s['sev'].get('high', 0)}</td>
          <td>{s['sev'].get('medium', 0)}</td>
          <td>{s['sev'].get('low', 0)}</td>
        </tr>
        """

    html_recs = ""
    for rec in recommendations:
        html_recs += f"<p style='margin-bottom: 12px; font-size: 0.95rem; color: var(--text);'>{rec}</p>"

    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Security Assessment Portal | OrbitX</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        :root {{
          --bg: #070913;
          --card-bg: rgba(18, 22, 41, 0.7);
          --card-border: rgba(255, 255, 255, 0.06);
          --text: #e2e8f0;
          --muted: #8a99ad;
          --green: #10b981;
          --red: #ef4444;
          --yellow: #f59e0b;
          --purple: #8b5cf6;
          --blue: #3b82f6;
          --cyan: #06b6d4;
        }}
        body {{
          font-family: 'Outfit', sans-serif;
          background-color: var(--bg);
          color: var(--text);
          padding: 40px 24px;
        }}
        .wrap {{ max-width: 1000px; margin: 0 auto; }}
        header {{
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }}
        h1 {{ font-size: 1.8rem; font-weight: 800; color: #fff; }}
        .badge {{ padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }}
        .badge-green {{ background: rgba(16, 185, 129, 0.15); color: var(--green); border: 1px solid var(--green); }}
        .badge-red {{ background: rgba(239, 68, 68, 0.15); color: var(--red); border: 1px solid var(--red); }}
        .badge-yellow {{ background: rgba(245, 158, 11, 0.15); color: var(--yellow); border: 1px solid var(--yellow); }}
        .card {{
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
        }}
        h2 {{ font-size: 1.25rem; font-weight: 700; margin-bottom: 18px; color: var(--muted); }}
        table {{ width: 100%; border-collapse: collapse; }}
        th {{ text-align: left; padding: 12px; color: var(--muted); font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid var(--card-border); }}
        td {{ padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); font-size: 0.95rem; }}
      </style>
    </head>
    <body>
      <div class="wrap">
        <header>
          <div>
            <h1>🛡️ OrbitX Security Assessment</h1>
            <p style="color: var(--muted); margin-top: 4px;">Unified security verification reports portal</p>
          </div>
          <div>
            <span class="badge { 'badge-green' if failed_scans == 0 else 'badge-red' }">{overall_status}</span>
            <div style="margin-top: 8px; font-size: 1.5rem; font-weight: 800; text-align: right;">{score}/100</div>
          </div>
        </header>

        <div class="card">
          <h2>📊 Vulnerability Severity Distribution</h2>
          <div style="display: flex; justify-content: space-around; align-items: flex-end; height: 180px; padding: 20px 0; background: rgba(255,255,255,0.01); border-radius: 12px; border: 1px solid var(--card-border); position: relative;">
            <div style="text-align: center; width: 60px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--red); margin-bottom: 6px;">{crit_total}</div>
              <div style="height: {crit_height}px; width: 36px; background: var(--red); border-radius: 6px; margin: 0 auto; min-height: 4px;"></div>
              <div style="font-size: 0.75rem; color: var(--muted); margin-top: 8px; font-weight: 600;">Critical</div>
            </div>
            <div style="text-align: center; width: 60px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--yellow); margin-bottom: 6px;">{high_total}</div>
              <div style="height: {high_height}px; width: 36px; background: var(--yellow); border-radius: 6px; margin: 0 auto; min-height: 4px;"></div>
              <div style="font-size: 0.75rem; color: var(--muted); margin-top: 8px; font-weight: 600;">High</div>
            </div>
            <div style="text-align: center; width: 60px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--blue); margin-bottom: 6px;">{med_total}</div>
              <div style="height: {med_height}px; width: 36px; background: var(--blue); border-radius: 6px; margin: 0 auto; min-height: 4px;"></div>
              <div style="font-size: 0.75rem; color: var(--muted); margin-top: 8px; font-weight: 600;">Medium</div>
            </div>
            <div style="text-align: center; width: 60px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--cyan); margin-bottom: 6px;">{low_total}</div>
              <div style="height: {low_height}px; width: 36px; background: var(--cyan); border-radius: 6px; margin: 0 auto; min-height: 4px;"></div>
              <div style="font-size: 0.75rem; color: var(--muted); margin-top: 8px; font-weight: 600;">Low</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>📊 Scanner Status Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Scanner Engine</th>
                <th>Category</th>
                <th>Findings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {html_scanner_rows}
            </tbody>
          </table>
        </div>

        <div class="card">
          <h2>📈 Vulnerability Severity Matrix</h2>
          <table>
            <thead>
              <tr>
                <th>Scanner Engine</th>
                <th>Critical</th>
                <th>High</th>
                <th>Medium</th>
                <th>Low</th>
              </tr>
            </thead>
            <tbody>
              {html_sev_rows}
            </tbody>
          </table>
        </div>

        <div class="card">
          <h2>💡 Remediation Recommendations</h2>
          {html_recs}
        </div>
      </div>
    </body>
    </html>
    """
    with open("reports/security.html", "w", encoding="utf-8") as f:
        f.write(html_body)

    print("[Security Compiler] ✅ Security compilation complete!")
    sys.exit(0)

if __name__ == "__main__":
    main()
