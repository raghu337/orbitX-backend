# Mobile E2E Test Suite (Appium & WebdriverIO)

This directory is configured for WebdriverIO and Appium automated mobile testing targeting the OrbitX React Native Expo iOS and Android builds.

## Configuration
- WebdriverIO config file: `mobile/wdio.conf.js`
- Drivers: Appium UiAutomator2 (Android) & XCUITest (iOS)

## Execution
Run mobile tests using npm:
```bash
npm run test:mobile
```
Or with WebdriverIO CLI:
```bash
npx wdio run mobile/wdio.conf.js
```

## Reports
JUnit XML reports and failure screenshots are saved to `reports/` and `reports/screenshots/`.
