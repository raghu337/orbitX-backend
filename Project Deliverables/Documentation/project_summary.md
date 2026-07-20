# OrbitX Integration and E2E QA Project Summary

This summary provides a technical overview of the backend services, test automation infrastructure, and reporting pipelines deployed for the OrbitX project.

---

## 1. System Components Overview

```text
+-------------------+      Rest Query      +--------------------+
|  FastAPI Backend  | -------------------> | Firebase Database  |
| (Async Python 3)  |                      | (NoSQL JSON Store) |
+-------------------+                      +--------------------+
         ^
         |
         |  Selenium Interactions
         |
+--------------------+
|  E2E Test Engine   |
| (Pytest / Chrome)  |
+--------------------+
         |
         |  Generates
         v
+-----------------------------+
| Custom Excel / MD / HTML    |
| (Reports & Screenshots)     |
+-----------------------------+
```

### 1.1 Backend Architecture
The backend is built as an async Python 3 web service utilizing FastAPI. It handles routing namespaces, user management, and orbits calculations. System telemetry is backed by a Firebase Realtime Database. Groq LLM integration powers the AI tutoring responses.

### 1.2 API Catalog
All core features map to a REST API. Active endpoints are registered under `/api/v1` and handle login sessions, satellite coordinates registry, pass prediction projections, and course progress tracking.

### 1.3 Selenium POM Framework
The client validation engine utilizes Selenium WebDriver (Python binding) and Pytest. It adopts the Page Object Model (POM) pattern. Explicit waits prevent race conditions during UI page transitions.

### 1.4 GitHub Actions CI/CD Pipeline
Continuous integration builds are run inside GitHub containers upon repository updates. Pipeline runs automatically fetch Google Chrome packages, map repository secrets, execute tests in headless mode, and upload all report artifacts.

### 1.5 Custom Test Reporting Process
The custom `ExtendedReporter` runs at the session end hook, compiling raw testing results into:
- **Excel Workbook**: Contains sheets for results, summaries, failed logs, and environment configurations.
- **Markdown Files**: Generates summary dashboards, high-level status evaluations, and traceback sheets with embedded failures screenshots.
- **HTML Report**: Provides an interactive browser validation interface.
