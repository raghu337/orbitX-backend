/**
 * OrbitX - WebdriverIO & Appium Configuration for React Native Expo Mobile App
 * Supports local and CI automated mobile testing (Android UIAutomator2 & iOS XCUITest).
 */

const path = require('path');

exports.config = {
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  path: '/',

  // ==================
  // Specify Test Files
  // ==================
  specs: [
    './mobile/tests/**/*.spec.js',
    './mobile/tests/**/*.test.js',
    './mobile/tests/**/*.ts'
  ],
  exclude: [],

  // ============
  // Capabilities
  // ============
  maxInstances: 1,
  capabilities: process.env.MOBILE_PLATFORM === 'ios' ? [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 15',
      'appium:platformVersion': process.env.IOS_VERSION || '17.2',
      'appium:app': process.env.IOS_APP_PATH || path.join(__dirname, '../build/OrbitX.app'),
      'appium:newCommandTimeout': 240,
    }
  ] : [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
      'appium:app': process.env.ANDROID_APP_PATH || path.join(__dirname, '../build/OrbitX.apk'),
      'appium:appPackage': 'com.orbitx.app',
      'appium:appActivity': '.MainActivity',
      'appium:newCommandTimeout': 240,
    }
  ],

  // ===================
  // Test Configurations
  // ===================
  logLevel: 'info',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ['appium'],
  framework: 'mocha',
  reporters: [
    'spec',
    ['junit', {
      outputDir: './reports',
      outputFileFormat: function(opts) {
        return `mobile-junit-${opts.cid}.xml`;
      }
    }]
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },

  // =====
  // Hooks
  // =====
  afterTest: async function (test, context, { error, result, duration, passed, retries }) {
    if (error) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filepath = path.join(__dirname, `../reports/screenshots/mobile_fail_${timestamp}.png`);
      await driver.saveScreenshot(filepath);
    }
  }
};
