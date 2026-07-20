import json
import os
import sys

def parse_gitleaks(report_dir):
    path = os.path.join(report_dir, "gitleaks-report.json")
    findings = []
    if os.path.exists(path):
        try:
            with open(path) as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        findings.append({
                            "rule": item.get("RuleID", "Generic Secret"),
                            "file": item.get("File", "Unknown"),
                            "line": item.get("StartLine", 0),
                            "offense": item.get("Match", "Hidden"),
                            "severity": "CRITICAL"
                        })
        except Exception as e:
            print(f"[Security Compiler] Error reading Gitleaks: {e}")
    return findings

def parse_semgrep(report_dir):
    path = os.path.join(report_dir, "semgrep.sarif")
    findings = []
    if os.path.exists(path):
        try:
            with open(path) as f:
                data = json.load(f)
            runs = data.get("runs", [])
            for run in runs:
                results = run.get("results", [])
                for res in results:
                    rule_id = res.get("ruleId", "Semgrep Rule")
                    msg = res.get("message", res.get("ruleId", ""))
                    msg = msg.strip().replace("\n", " ")
                    if len(msg) > 120:
                        msg = msg[:117] + "..."
                        
                    locations = res.get("locations", [])
                    file_path = "Unknown"
                    line_num = 0
                    if locations:
                        phys = locations[0].get("physicalLocation", {})
                        file_path = phys.get("artifactLocation", {}).get("uri", "Unknown")
                        line_num = phys.get("region", {}).get("startLine", 0)
                        
                    # Map semgrep severity to standard ones
                    level = res.get("properties", {}).get("security-severity", "info").upper()
                    if level in ["ERROR", "CRITICAL", "HIGH"]:
                        severity = "HIGH"
                    elif level in ["WARNING", "MEDIUM"]:
                        severity = "MEDIUM"
                    else:
                        severity = "LOW"
                        
                    findings.append({
                        "rule": rule_id,
                        "file": file_path,
                        "line": line_num,
                        "message": msg,
                        "severity": severity
                    })
        except Exception as e:
            print(f"[Security Compiler] Error reading Semgrep: {e}")
    return findings

def parse_trivy(report_dir):
    path = os.path.join(report_dir, "trivy-report.json")
    findings = []
    if os.path.exists(path):
        try:
            with open(path) as f:
                data = json.load(f)
            results = data.get("Results", [])
            for res in results:
                target = res.get("Target", "Unknown")
                vulns = res.get("Vulnerabilities", []) or []
                for v in vulns:
                    severity = v.get("Severity", "UNKNOWN")
                    # Normalize severity names
                    if severity == "UNKNOWN":
                        severity = "LOW"
                    findings.append({
                        "id": v.get("VulnerabilityID", "CVE-Unknown"),
                        "library": v.get("PkgName", "Unknown"),
                        "version": v.get("InstalledVersion", "N/A"),
                        "fixed_in": v.get("FixedVersion", "N/A"),
                        "title": v.get("Title", "No title"),
                        "target": target,
                        "severity": severity
                    })
        except Exception as e:
            print(f"[Security Compiler] Error reading Trivy: {e}")
    return findings

def compile_reports():
    # Reports might be downloaded into 'security-reports' or 'reports' directories in CI
    input_dirs = ["security-reports", "reports"]
    report_dir = "security-reports"
    for d in input_dirs:
        if os.path.exists(os.path.join(d, "gitleaks-report.json")) or os.path.exists(os.path.join(d, "semgrep.sarif")):
            report_dir = d
            break
            
    print(f"[Security Compiler] Reading raw findings from folder: '{report_dir}'...")
    
    gitleaks_secrets = parse_gitleaks(report_dir)
    semgrep_sast = parse_semgrep(report_dir)
    trivy_deps = parse_trivy(report_dir)
    
    os.makedirs("reports", exist_ok=True)
    
    # -------------------------------------------------------------------------
    # 1. Generate reports/security-report.md
    # -------------------------------------------------------------------------
    sec_report_path = "reports/security-report.md"
    
    # Calculate statistics
    total_secrets = len(gitleaks_secrets)
    total_sast = len(semgrep_sast)
    critical_sast = sum(1 for f in semgrep_sast if f["severity"] == "HIGH")
    medium_sast = sum(1 for f in semgrep_sast if f["severity"] == "MEDIUM")
    low_sast = sum(1 for f in semgrep_sast if f["severity"] == "LOW")
    
    status = "PASSED"
    if total_secrets > 0 or critical_sast > 0:
        status = "FAILED"
        
    status_emoji = "🟢" if status == "PASSED" else "🔴"
    
    sec_md = [
        f"# 🛡️ OrbitX Security Scanning Report",
        "",
        f"## Overall Security Status: {status_emoji} {status}",
        "",
        "### Scan Summary",
        f"- **Secret Leaks Detected**: {total_secrets}",
        f"- **SAST Vulnerabilities**: {total_sast} (High: {critical_sast}, Medium: {medium_sast}, Low: {low_sast})",
        "",
    ]
    
    if gitleaks_secrets:
        sec_md.append("### 🔑 Exposed Credentials Details")
        sec_md.append("| Rule | File Path | Line | Offense | Severity |")
        sec_md.append("|---|---|---|---|---|")
        for s in gitleaks_secrets:
            sec_md.append(f"| {s['rule']} | `{s['file']}` | {s['line']} | `{s['offense'][:30]}` | **{s['severity']}** |")
        sec_md.append("")
        
    if semgrep_sast:
        sec_md.append("### 🔍 Static Application Security (SAST) Findings")
        sec_md.append("| Severity | Rule | File Path | Line | Message |")
        sec_md.append("|---|---|---|---|---|")
        for s in semgrep_sast:
            sec_md.append(f"| {s['severity']} | {s['rule']} | `{s['file']}` | {s['line']} | {s['message']} |")
        sec_md.append("")
    else:
        sec_md.append("### 🔍 Static Application Security (SAST)")
        sec_md.append("✅ No static analysis vulnerabilities detected.")
        sec_md.append("")
        
    with open(sec_report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sec_md))
    print(f"[Security Compiler] Compiled Security Report at {sec_report_path}")
    
    # -------------------------------------------------------------------------
    # 2. Generate reports/dependency-report.md
    # -------------------------------------------------------------------------
    dep_report_path = "reports/dependency-report.md"
    
    critical_deps = sum(1 for d in trivy_deps if d["severity"] in ["CRITICAL", "HIGH"])
    medium_deps = sum(1 for d in trivy_deps if d["severity"] == "MEDIUM")
    low_deps = sum(1 for d in trivy_deps if d["severity"] == "LOW")
    
    dep_status = "PASSED" if critical_deps == 0 else "FAILED"
    dep_status_emoji = "🟢" if dep_status == "PASSED" else "🔴"
    
    dep_md = [
        f"# 📦 OrbitX Dependency & Compliance Report",
        "",
        f"## Dependency Status: {dep_status_emoji} {dep_status}",
        "",
        "### Vulnerability Counts",
        f"- **Critical/High Severity**: {critical_deps}",
        f"- **Medium Severity**: {medium_deps}",
        f"- **Low Severity**: {low_deps}",
        "",
    ]
    
    if trivy_deps:
        dep_md.append("### 🚨 Package Vulnerabilities Details")
        dep_md.append("| Severity | CVE/ID | Library | Installed | Fixed In | Target / Path |")
        dep_md.append("|---|---|---|---|---|---|")
        for d in trivy_deps:
            dep_md.append(f"| {d['severity']} | {d['id']} | `{d['library']}` | `{d['version']}` | `{d['fixed_in']}` | `{d['target']}` |")
        dep_md.append("")
    else:
        dep_md.append("### 🚨 Package Vulnerabilities")
        dep_md.append("✅ No package dependencies vulnerabilities detected by Trivy.")
        dep_md.append("")
        
    # Append any pip-audit or npm-audit summaries if available
    audit_files = ["pip-audit-report.md", "npm-audit-report.md"]
    for af in audit_files:
        af_path = os.path.join(report_dir, af)
        if os.path.exists(af_path):
            dep_md.append(f"### 📋 Detailed Ecosystem Logs ({af.replace('-report.md', '')})")
            dep_md.append("```markdown")
            try:
                with open(af_path) as f:
                    dep_md.append(f.read())
            except Exception:
                pass
            dep_md.append("```")
            dep_md.append("")
            
    with open(dep_report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(dep_md))
    print(f"[Security Compiler] Compiled Dependency Report at {dep_report_path}")

if __name__ == "__main__":
    compile_reports()
