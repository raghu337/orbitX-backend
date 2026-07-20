# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---

## 🚀 OrbitX DevSecOps Enterprise CI/CD Pipeline

The project features an automated, multi-stage Enterprise CI/CD pipeline built with GitHub Actions ([`orbitx-enterprise-ci.yml`](file:///.github/workflows/orbitx-enterprise-ci.yml)).

### Pipeline Jobs & Telemetry Matrix
1. **🛠️ Build Backend**: Automates framework auto-detection, setups python, checks compilation, and runs verification checks.
2. **🧪 Unit Testing**: Runs Pytest unit tests, compiling JUnit XML and Code Coverage reports (XML, HTML, SVG Badge).
3. **📡 API Testing**: Discovers registered API endpoints and runs Newman collections / pytest integration suites.
4. **🌐 Selenium Web Testing**: Multi-browser matrix across Chrome, Firefox, and Edge headless. Generates Excel/HTML logs and screenshots on failure.
5. **⚡ Performance Testing (k6)**: Load tests scaling up to 500 VUs, tracking response time latency (p95, p99) and success rates.
6. **🛡️ Security Scanning**: Audits SAST vulnerabilities (Semgrep, CodeQL) and filesystem (Trivy).
7. **📦 Dependency Scanning**: SCA audits using npm-audit, pip-audit, and Safety checks.
8. **🔑 Secret Detection**: Runs Gitleaks across history to ensure no exposed credentials.
9. **📐 Code Quality**: Runs linters (Black, Flake8, isort, ESLint).
10. **🐳 Docker Build**: Builds and inspects Docker container images for backend and frontend.
11. **🚀 Deployment Verification**: Spins up the application stack using Docker Compose and runs deployment verification tests.
12. **📊 Aggregate Reports**: Consolidated telemetry compiling reports into an OrbitX HTML Dashboard (`reports/dashboard.html`).

### Output Artifacts Location
All pipeline reports and execution logs are compiled inside the `reports/` folder:
- [`reports/security-report.md`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/reports/security-report.md) - Consolidated vulnerabilities report
- [`reports/performance-report.md`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/reports/performance-report.md) - Latency metrics summary
- [`reports/selenium-report.html`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/reports/selenium-report.html) - Web UI matrix outcome
- [`reports/api-report.html`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/reports/api-report.html) - Newman API execution details
- [`reports/dependency-report.md`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/reports/dependency-report.md) - Third-party package health
- [`reports/coverage-report.html`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/reports/coverage-report.html) - Code coverage HTML details
- [`reports/test-results.xlsx`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/reports/test-results.xlsx) - Excel-formatted QA test execution summary
- [`reports/executive-summary.md`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/reports/executive-summary.md) - GitHub step summary Markdown table
- [`reports/dashboard.html`](file:///c:/Users/rajir/OneDrive/Desktop/orbitX/reports/dashboard.html) - Premium interactive HTML telemetry console

