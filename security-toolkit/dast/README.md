# OWASP ZAP Dynamic Application Security Testing (DAST)

This directory contains shell scripts to run automated active vulnerability scans against a live target application or API.

---

## 1. Prerequisites
- **Docker Desktop** installed and running on your system.
- The target application must be running and accessible.
  - If running locally, ZAP inside the Docker container accesses your host network using the alias `host.docker.internal`.

---

## 2. Scan Scenarios

### A. Baseline Scan (`zap-baseline.sh`)
Quick passive analysis of your target portal to identify headers configuration issues or SSL defects.
```bash
./zap-baseline.sh http://host.docker.internal:8080
```

### B. Full Active Scan (`zap-full-scan.sh`)
Runs deep spiders and active payloads against the forms, inputs, and components.
```bash
./zap-full-scan.sh http://host.docker.internal:8080
```

### C. OpenAPI Specification Scan (`api-scan.sh`)
Targets JSON Swagger declarations on the backend, checking for API logic or injection flaws.
```bash
./api-scan.sh http://host.docker.internal:8000/openapi.json
```

---

## 3. Generated Reports
Results are exported directly into the `security-toolkit/reports/` directory:
- `zap-baseline-report.html`
- `zap-full-report.html`
- `zap-api-report.html`
