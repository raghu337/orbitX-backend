/**
 * OrbitX - k6 Performance & Load Testing Enterprise Configuration Module
 * Configured for testing FastAPI backend microservices and JWT endpoints.
 */

export const BASE_URL = __ENV.K6_TARGET_URL || 'http://127.0.0.1:8000';

// Enterprise Load Test Profiles
export const profiles = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '30s',
  },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 20 },
      { duration: '3m', target: 20 },
      { duration: '1m', target: 0 },
    ],
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 0 },
    ],
  },
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '10s', target: 100 },
      { duration: '1m', target: 100 },
      { duration: '10s', target: 0 },
    ],
  },
};

// Default Configuration Options for k6 Runner
export const options = {
  scenarios: {
    default_load: profiles[__ENV.K6_PROFILE || 'smoke'],
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // <1% errors allowed
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms
    http_reqs: ['count>10'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Standard Header Generator Helper
export function getStandardHeaders(token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'OrbitX-k6-PerformanceEngine/1.0',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
