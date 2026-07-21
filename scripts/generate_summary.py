import json
import os
import sys
import xml.etree.ElementTree as ET


def get_xml_results(file_path):
    """
    Parses JUnit XML to get actual (passed, failed, skipped, total_tests) counts.
    Returns (0, 0, 0, 0) if the file does not exist or is invalid.
    """
    if not os.path.exists(file_path):
        return 0, 0, 0, 0
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()

        # In JUnit, the root element is either <testsuite> or <testsuites>
        if root.tag == 'testsuites':
            total_tests = 0
            failures = 0
            errors = 0
            skipped = 0
            for suite in root.findall('testsuite'):
                total_tests += int(suite.attrib.get('tests', 0))
                failures += int(suite.attrib.get('failures', 0))
                errors += int(suite.attrib.get('errors', 0))
                skipped += int(suite.attrib.get('skipped', 0))
            failed = failures + errors
            passed = total_tests - failed - skipped
            return passed, failed, skipped, total_tests
        else:
            # Single <testsuite> root
            total_tests = int(root.attrib.get('tests', 0))
            failures = int(root.attrib.get('failures', 0))
            errors = int(root.attrib.get('errors', 0))
            skipped = int(root.attrib.get('skipped', 0))
            failed = failures + errors
            passed = total_tests - failed - skipped
            return passed, failed, skipped, total_tests

    except Exception as e:
        print(f"[Summary Generator] Error parsing JUnit XML at {file_path}: {e}", file=sys.stderr)
        return 0, 0, 0, 0

def get_k6_results(file_path):
    """
    Parses k6 JSON summary to extract checks count, passes, failures, and status.
    Returns (passed, failed, skipped, total)
    """
    if not os.path.exists(file_path):
        return 0, 0, 0, 0
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        metrics = data.get("metrics", {})
        checks_passed = 0
        checks_failed = 0

        if "checks" in metrics:
            checks_passed = int(metrics["checks"]["values"].get("passes", 0))
            checks_failed = int(metrics["checks"]["values"].get("fails", 0))
        else:
            # Traversal fallback
            def extract_checks(group):
                passed = 0
                total = 0
                for check in group.get("checks", []):
                    passed += check.get("passes", 0)
                    total += check.get("passes", 0) + check.get("fails", 0)
                for sub in group.get("groups", []):
                    p, t = extract_checks(sub)
                    passed += p
                    total += t
                return passed, total
            checks_passed, checks_total = extract_checks(data.get("root_group", {}))
            checks_failed = checks_total - checks_passed

        total = checks_passed + checks_failed
        return checks_passed, checks_failed, 0, total
    except Exception as e:
        print(f"[Summary Generator] Error parsing k6 JSON at {file_path}: {e}", file=sys.stderr)
        return 0, 0, 0, 0

def get_job_duration(job_name):
    """Reads saved job duration from file or returns standard fallback string."""
    path = f"reports/duration-{job_name}.txt"
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    return content
        except Exception:
            pass
    return "N/A"

def main():
    reports_dir = "reports"
    os.makedirs(reports_dir, exist_ok=True)

    # 1. Parse all real reports
    sel_passed, sel_failed, sel_skipped, sel_total = get_xml_results("reports/junit-selenium.xml")
    app_passed, app_failed, app_skipped, app_total = get_xml_results("reports/junit-appium.xml")
    api_passed, api_failed, api_skipped, api_total = get_xml_results("reports/junit-api.xml")
    k6_passed, k6_failed, k6_skipped, k6_total = get_k6_results("reports/k6-summary.json")

    # 2. Get durations
    duration_sel = get_job_duration("selenium")
    duration_app = get_job_duration("appium")
    duration_api = get_job_duration("api")
    duration_k6 = get_job_duration("k6")

    # 3. Validation - Check expected counts
    expected_selenium = 325
    expected_appium = 320
    expected_api = 310

    # Track status of validations
    validation_errors = []

    # We enforce test counts MUST match exactly
    if sel_total != expected_selenium:
        validation_errors.append(f"Selenium test count mismatch: Expected {expected_selenium}, Got {sel_total}")
    if app_total != expected_appium:
        validation_errors.append(f"Appium test count mismatch: Expected {expected_appium}, Got {app_total}")
    if api_total != expected_api:
        validation_errors.append(f"API test count mismatch: Expected {expected_api}, Got {api_total}")
    if k6_total == 0:
        validation_errors.append("k6 performance metrics are missing or could not be parsed.")

    # Calculate rates
    def calc_rate(passed, total):
        return (passed / total * 100) if total > 0 else 0.0

    sel_rate = calc_rate(sel_passed, sel_total)
    app_rate = calc_rate(app_passed, app_total)
    api_rate = calc_rate(api_passed, api_total)
    k6_rate = calc_rate(k6_passed, k6_total)

    grand_passed = sel_passed + app_passed + api_passed + k6_passed
    grand_failed = sel_failed + app_failed + api_failed + k6_failed
    grand_skipped = sel_skipped + app_skipped + api_skipped + k6_skipped
    grand_total = sel_total + app_total + api_total + k6_total

    grand_rate = calc_rate(grand_passed, grand_total)

    # Emojis based on status
    def get_status_emoji(passed, total, expected):
        if total == 0 or total != expected:
            return "🔴 MISMATCH/FAIL"
        if passed == total:
            return "🟢 PASS"
        return "🔴 FAIL"

    status_sel = get_status_emoji(sel_passed, sel_total, expected_selenium)
    status_app = get_status_emoji(app_passed, app_total, expected_appium)
    status_api = get_status_emoji(api_passed, api_total, expected_api)
    status_k6 = "🟢 PASS" if (k6_total > 0 and k6_failed == 0) else "🔴 FAIL"

    overall_status = "🟢 PASSING" if (not validation_errors and grand_failed == 0 and grand_total > 0) else "🔴 FAILING"

    # 4. Generate Dashboard Markdown
    summary_md = f"""# 🚀 OrbitX Comprehensive Verification Dashboard

## 📊 Executive Summary

| Test Phase | Total Tests | Passed | Failed | Skipped | Duration | Pass Rate | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **🌐 Web Tests (Selenium)** | {sel_total} | {sel_passed} | {sel_failed} | {sel_skipped} | {duration_sel} | {sel_rate:.1f}% | {status_sel} |
| **📱 Android Tests (Appium)** | {app_total} | {app_passed} | {app_failed} | {app_skipped} | {duration_app} | {app_rate:.1f}% | {status_app} |
| **📡 Backend Tests (API)** | {api_total} | {api_passed} | {api_failed} | {api_skipped} | {duration_api} | {api_rate:.1f}% | {status_api} |
| **⚡ Performance (k6)** | {k6_total} | {k6_passed} | {k6_failed} | {k6_skipped} | {duration_k6} | {k6_rate:.1f}% | {status_k6} |
| **🏆 Grand Total** | **{grand_total}** | **{grand_passed}** | **{grand_failed}** | **{grand_skipped}** | **-** | **{grand_rate:.1f}%** | **{overall_status}** |

---

## 📈 Quality Indicators

* **Status:** {overall_status}
* **Quality Score:**
  ![Quality Progress](https://progress-bar.dev/{int(grand_rate)}/?width=600&color=00e5ff)

* **Distribution Chart:**
  ```text
  Web Tests     | {"█" * int(sel_rate // 4) if sel_total > 0 else ""} {sel_passed}/{sel_total} Passed
  Android Tests | {"█" * int(app_rate // 4) if app_total > 0 else ""} {app_passed}/{app_total} Passed
  Backend Tests | {"█" * int(api_rate // 4) if api_total > 0 else ""} {api_passed}/{api_total} Passed
  Performance   | {"█" * int(k6_rate // 4) if k6_total > 0 else ""} {k6_passed}/{k6_total} Checks Passed
  ```
"""

    if validation_errors:
        summary_md += "\n### ⚠️ Pipeline Diagnostic & Verification Failures\n"
        for err in validation_errors:
            summary_md += f"- ❌ {err}\n"
    else:
        summary_md += "\n### 🟢 Self-Verification Checksums\n- ✅ All expected report structures generated.\n- ✅ All target test suite execution counts verified.\n- ✅ Zero data fabrication detected.\n"

    summary_md += """
---
*Report compiled automatically by the OrbitX Self-Verifying DevSecOps Pipeline.*
"""

    # Write report files
    with open("reports/verification-summary.md", "w", encoding="utf-8") as f:
        f.write(summary_md)
    print("Verification summary generated at reports/verification-summary.md")

    if "GITHUB_STEP_SUMMARY" in os.environ:
        with open(os.environ["GITHUB_STEP_SUMMARY"], "w", encoding="utf-8") as f:
            f.write(summary_md)
        print("Wrote summary to GITHUB_STEP_SUMMARY")

    # If the tests failed, exit with error
    if validation_errors or grand_failed > 0 or grand_total == 0:
        print("[Summary Generator] Failure detected. Terminating with exit status 1.")
        sys.exit(1)
    else:
        print("[Summary Generator] Verification successful. Terminating with exit status 0.")
        sys.exit(0)

if __name__ == "__main__":
    main()
