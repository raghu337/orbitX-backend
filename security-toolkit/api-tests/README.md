# Newman API Automation Testing

This directory holds a Postman collection mapping out major REST endpoints, auth structures, and response assertions.

---

## 1. Prerequisites
- **Node.js** (v16 or higher)
- **Newman** (cli-based Postman test runner):
  ```bash
  npm install -g newman
  ```

---

## 2. Command Guidelines

### Run utilizing Shell Scripts
```bash
./newman_runner.sh
```

### Run manually using customized Environment overrides
```bash
newman run postman_collection.json \
  -e environment.json \
  --env-var "base_url=https://staging.orbitx-app.com" \
  --env-var "test_user=admin@orbitx.com" \
  --reporters cli
```

---

## 3. Reports
Execution outcomes are exported in both HTML and JSON format under `reports/` folder:
- `newman-report.html`
- `newman-report.json`
