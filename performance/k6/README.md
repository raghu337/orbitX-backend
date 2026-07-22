# Performance & Load Test Suite (k6)

This directory contains modular k6 load testing configurations for OrbitX FastAPI backend services.

## Configuration
- Main Config Module: `performance/k6/k6.config.js`
- Profiles supported: `smoke`, `load`, `stress`, `spike`

## Execution
Run k6 tests using npm:
```bash
npm run test:k6
```
Or directly with k6 CLI:
```bash
k6 run performance/k6/k6.config.js
```

## Environment Variables
- `K6_TARGET_URL`: Target base URL (default: `http://127.0.0.1:8000`)
- `K6_PROFILE`: Profile type (`smoke`, `load`, `stress`, `spike`)
