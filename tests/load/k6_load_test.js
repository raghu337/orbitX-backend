import http from 'k6/http';
import { sleep, check } from 'k6';

// Read target URL from environment or default
const TARGET_URL = __ENV.K6_TARGET_URL || 'http://127.0.0.1:8000';

export const options = {
  vus: 100,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.05'],     // Under 5% errors
    http_req_duration: ['p(95)<1000'],  // 95% of requests under 1000ms
  },
};

export default function () {
  // Test root/health endpoint
  let resHealth = http.get(`${TARGET_URL}/health`);
  check(resHealth, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(0.5);
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
