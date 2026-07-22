# Frontend Web E2E Test Suite (Playwright)

This directory is configured for Playwright Web End-to-End (E2E) testing for OrbitX web frontend / React Native Web application.

## Configuration
- Root config file: `playwright.config.ts`
- Browsers configured: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## Execution
Run Playwright tests using npm:
```bash
npm run test:frontend
```
Or directly using Playwright CLI:
```bash
npx playwright test --config=playwright.config.ts
```

## Reports
HTML test reports are automatically saved to `reports/playwright-report/` and JUnit XML to `reports/playwright-junit.xml`.
