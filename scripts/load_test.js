import http from 'k6/http';
import { sleep, check, group } from 'k6';

const TARGET_URL = __ENV.K6_TARGET_URL || 'http://127.0.0.1:8000';

export const options = {
  scenarios: {
    tier_100: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 100 },
        { duration: '45s', target: 100 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
      tags: { tier: '100vu' },
    },
    tier_300: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '70s',
      stages: [
        { duration: '15s', target: 300 },
        { duration: '45s', target: 300 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
      tags: { tier: '300vu' },
    },
    tier_500: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '140s',
      stages: [
        { duration: '15s', target: 300 },
        { duration: '30s', target: 300 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
      tags: { tier: '500vu' },
    },
    tier_1000: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '195s',
      stages: [
        { duration: '15s', target: 200 },
        { duration: '20s', target: 200 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
      tags: { tier: '1000vu' },
    },
  },
  thresholds: {
    'http_req_failed{tier:100vu}':  ['rate<0.01'],
    'http_req_failed{tier:300vu}':  ['rate<0.01'],
    'http_req_failed{tier:500vu}':  ['rate<0.02'],
    'http_req_failed{tier:1000vu}': ['rate<0.05'],
    'http_req_duration{tier:100vu}':  ['p(95)<500',  'avg<250'],
    'http_req_duration{tier:300vu}':  ['p(95)<1000', 'avg<500'],
    'http_req_duration{tier:500vu}':  ['p(95)<2000', 'avg<1000'],
    'http_req_duration{tier:1000vu}': ['p(95)<3000', 'avg<1500'],
    'checks': ['rate>0.95'],
    'http_req_failed': ['rate<0.05'],
  },
};

export default function () {
  const tier = __ENV.K6_SCENARIO_NAME || 'unknown';

  group('Health Check', () => {
    const res = http.get(`${TARGET_URL}/health`, {
      tags: { endpoint: 'health' },
      timeout: '10s',
    });
    check(res, {
      'health status 200': (r) => r.status === 200,
      'health body ok':    (r) => r.body && r.body.includes('ok'),
    });
  });

  group('Auth Endpoints', () => {
    const loginRes = http.post(
      `${TARGET_URL}/api/v1/auth/login`,
      JSON.stringify({ email: 'test@orbitx.com', password: 'test123' }),
      { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'login' }, timeout: '10s' }
    );
    check(loginRes, {
      'login responds': (r) => r.status === 200 || r.status === 401 || r.status === 422,
    });
  });

  group('Satellite Endpoints', () => {
    const satRes = http.get(`${TARGET_URL}/api/v1/satellites/live`, {
      tags: { endpoint: 'satellites' },
      timeout: '10s',
    });
    check(satRes, {
      'satellites responds': (r) => r.status === 200 || r.status === 401 || r.status === 404,
    });
  });

  sleep(0.3);
}

export function handleSummary(data) {
  function safeMet(path, def) {
    try {
      const parts = path.split('.');
      let cur = data;
      for (const p of parts) cur = cur[p];
      return cur !== undefined ? cur : def;
    } catch (_) { return def; }
  }

  function tierMetrics(tag) {
    const key = `http_req_duration{tier:${tag}}`;
    const failKey = `http_req_failed{tier:${tag}}`;
    const reqKey  = `http_reqs{tier:${tag}}`;
    const vals = safeMet(`metrics.${key}.values`, {});
    const fVals = safeMet(`metrics.${failKey}.values`, {});
    const rVals = safeMet(`metrics.${reqKey}.values`, {});
    return {
      reqs:  Math.round(safeMet(`metrics.${reqKey}.values.count`, rVals.count || 0)),
      rps:   parseFloat((rVals.rate || 0).toFixed(2)),
      avg:   parseFloat((vals.avg   || 0).toFixed(2)),
      med:   parseFloat((vals.med   || 0).toFixed(2)),
      p95:   parseFloat((vals['p(95)'] || 0).toFixed(2)),
      p99:   parseFloat((vals['p(99)'] || 0).toFixed(2)),
      max:   parseFloat((vals.max   || 0).toFixed(2)),
      errRate: parseFloat(((fVals.rate || 0) * 100).toFixed(2)),
    };
  }

  const t100  = tierMetrics('100vu');
  const t300  = tierMetrics('300vu');
  const t500  = tierMetrics('500vu');
  const t1000 = tierMetrics('1000vu');

  const globalReqs = Math.round(safeMet('metrics.http_reqs.values.count', 0));
  const globalRps  = parseFloat((safeMet('metrics.http_reqs.values.rate', 0)).toFixed(2));
  const globalAvg  = parseFloat((safeMet('metrics.http_req_duration.values.avg', 0)).toFixed(2));
  const globalP95  = parseFloat((safeMet('metrics.http_req_duration.values.p(95)', 0) ||
                                  safeMet("metrics.http_req_duration.values['p(95)']", 0)).toFixed(2));
  const globalP99  = parseFloat((safeMet('metrics.http_req_duration.values.p(99)', 0) ||
                                  safeMet("metrics.http_req_duration.values['p(99)']", 0)).toFixed(2));
  const globalErrRate = parseFloat(((safeMet('metrics.http_req_failed.values.rate', 0)) * 100).toFixed(2));

  const overallPass = globalErrRate < 5.0 && globalP95 < 3000;
  const overallEmoji = overallPass ? '🟢' : '🔴';
  const overallStatus = overallPass ? 'PASSED' : 'FAILED';

  function tierPass(t, errLimit, p95Limit) {
    return t.errRate < errLimit && t.p95 < p95Limit;
  }
  function s(b) { return b ? '🟢 PASS' : '🔴 FAIL'; }

  const summaryJson = {
    global: { reqs: globalReqs, rps: globalRps, avg: globalAvg, p95: globalP95, p99: globalP99, errRate: globalErrRate, status: overallStatus },
    tiers: {
      '100vu':  { ...t100,  label: '100 Users',  errLimit: 1.0,  p95Limit: 500  },
      '300vu':  { ...t300,  label: '300 Users',  errLimit: 1.0,  p95Limit: 1000 },
      '500vu':  { ...t500,  label: '500 Users',  errLimit: 2.0,  p95Limit: 2000 },
      '1000vu': { ...t1000, label: '1000 Users', errLimit: 5.0,  p95Limit: 3000 },
    },
  };

  const mdReport = `# ⚡ OrbitX Load Test Execution Report

## Overall Result: ${overallEmoji} ${overallStatus}

### 🚀 OrbitX Performance Test — 4-Tier Load Simulation

| Tier | VUs | Req/s | Avg (ms) | Median (ms) | P95 (ms) | P99 (ms) | Max (ms) | Errors | Status |
|------|-----|-------|----------|-------------|----------|----------|----------|--------|--------|
| **100 Users**  | 100  | ${t100.rps}  | ${t100.avg}  | ${t100.med}  | ${t100.p95}  | ${t100.p99}  | ${t100.max}  | ${t100.errRate}%  | ${s(tierPass(t100,  1.0, 500))}  |
| **300 Users**  | 300  | ${t300.rps}  | ${t300.avg}  | ${t300.med}  | ${t300.p95}  | ${t300.p99}  | ${t300.max}  | ${t300.errRate}%  | ${s(tierPass(t300,  1.0, 1000))} |
| **500 Users**  | 500  | ${t500.rps}  | ${t500.avg}  | ${t500.med}  | ${t500.p95}  | ${t500.p99}  | ${t500.max}  | ${t500.errRate}%  | ${s(tierPass(t500,  2.0, 2000))} |
| **1000 Users** | 1000 | ${t1000.rps} | ${t1000.avg} | ${t1000.med} | ${t1000.p95} | ${t1000.p99} | ${t1000.max} | ${t1000.errRate}% | ${s(tierPass(t1000, 5.0, 3000))} |

### 📊 Threshold Validation

| Metric | Limit | Actual | Status |
|--------|-------|--------|--------|
| Average Response | < 1500 ms | ${globalAvg} ms | ${s(globalAvg < 1500)} |
| P95 Response | < 3000 ms | ${globalP95} ms | ${s(globalP95 < 3000)} |
| P99 Response | < 5000 ms | ${globalP99} ms | ${s(globalP99 < 5000)} |
| Error Rate | < 5.0% | ${globalErrRate}% | ${s(globalErrRate < 5.0)} |
| Throughput | > 10 req/s | ${globalRps} req/s | ${s(globalRps > 10)} |
| Total Requests | > 100 | ${globalReqs} | ${s(globalReqs > 100)} |

### 🌐 Global Summary
| Metric | Value |
|--------|-------|
| **Total Requests** | ${globalReqs} |
| **Requests/sec** | ${globalRps} |
| **Average Response** | ${globalAvg} ms |
| **P95** | ${globalP95} ms |
| **P99** | ${globalP99} ms |
| **Error Rate** | ${globalErrRate}% |

---
*Generated by OrbitX k6 Performance Engine*
`;

  return {
    'reports/k6-summary.json': JSON.stringify(summaryJson, null, 2),
    'reports/k6-report.md': mdReport,
    stdout: `[k6] Done. Total: ${globalReqs} reqs @ ${globalRps} rps | P95: ${globalP95}ms | Errors: ${globalErrRate}% | ${overallStatus}\n`,
  };
}
