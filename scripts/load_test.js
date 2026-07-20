import http from 'k6/http';
import { sleep, check } from 'k6';

// Read target URL from environment or default
const TARGET_URL = __ENV.K6_TARGET_URL || 'http://localhost:8000';

export const options = {
  stages: [
    { duration: '10s', target: 100 },  // Ramp up to 100 VUs
    { duration: '15s', target: 300 },  // Ramp up to 300 VUs
    { duration: '15s', target: 500 },  // Ramp up to 500 VUs
    { duration: '10s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],     // Under 5% errors
    http_req_duration: ['p(95)<1000'],  // 95% of requests under 1000ms
  },
};

export default function () {
  // Test root endpoint
  let resRoot = http.get(`${TARGET_URL}/`);
  check(resRoot, {
    'root status is 200': (r) => r.status === 200,
  });
  sleep(0.1);

  // Test health check
  let resHealth = http.get(`${TARGET_URL}/health`);
  check(resHealth, {
    'health status is 200': (r) => r.status === 200,
  });
  sleep(0.2);
}

// Generate HTML and JSON reports natively
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

export function handleSummary(data) {
  return {
    "reports/k6-report.html": htmlReport(data),
    "reports/k6-summary.json": JSON.stringify(data),
    "stdout": textSummary(data, { indent: " ", enableColors: true }),
  };
}
