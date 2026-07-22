import http from 'k6/http';
import { sleep, check } from 'k6';

const TARGET_URL = __ENV.K6_TARGET_URL || 'http://127.0.0.1:8000';

export const options = {
  scenarios: {
    smoke_load: {
      executor: 'constant-vus',
      vus: 5,
      duration: '5s',
    },
  },
  thresholds: {
    checks: ['rate>0.95'],
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
  },
};

export default function () {
  const res = http.get(`${TARGET_URL}/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(0.2);
}
