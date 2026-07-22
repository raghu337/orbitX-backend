# Backend Pytest Suite

This directory contains FastAPI, SQLAlchemy, and JWT Authentication unit and integration tests.

## Configuration
- Root configuration file: `pytest.ini` and `pyproject.toml`
- Coverage rules: `.coveragerc`

## Execution
Run pytest suite:
```bash
npm run test:backend
```
Or directly:
```bash
pytest backend/tests --cov=backend/app
```
