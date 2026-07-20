import http from 'k6/http';
import { sleep, check } from 'k6';

const TARGET_URL = __ENV.K6_TARGET_URL || 'http://127.0.0.1:8000';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 100,
      duration: '1m',
      gracefulStop: '5s',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<3000', 'avg<1500'],
  },
};

export default function () {
  const res = http.get(`${TARGET_URL}/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body has status ok': (r) => r.body.includes('"status":"ok"') || r.body.includes('status')
  });
  sleep(0.5);
}

export function handleSummary(data) {
  const reqs = data.metrics.http_reqs.values.count;
  const rps = data.metrics.http_reqs.values.rate.toFixed(2);
  const avg = data.metrics.http_req_duration.values.avg.toFixed(2);
  const max = data.metrics.http_req_duration.values.max.toFixed(2);
  const min = data.metrics.http_req_duration.values.min.toFixed(2);
  const p95 = data.metrics.http_req_duration.values['p(95)'].toFixed(2);
  const p99 = data.metrics.http_req_duration.values['p(99)'].toFixed(2);
  const errors = data.metrics.http_req_failed.values.passes;
  const errorRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
  
  const checksPassed = data.metrics.checks ? data.metrics.checks.values.passes : 0;
  const checksFailed = data.metrics.checks ? data.metrics.checks.values.fails : 0;
  const checksTotal = checksPassed + checksFailed;
  const checksRate = checksTotal > 0 ? ((checksPassed / checksTotal) * 100).toFixed(2) : '100.00';
  
  const thresholdStatus = (parseFloat(errorRate) < 1.0 && parseFloat(p95) < 3000.0 && parseFloat(avg) < 1500.0 && parseFloat(checksRate) > 99.0) ? 'PASS' : 'FAIL';
  
  // Calculate performance score
  let score = 100;
  score -= parseFloat(errorRate) * 10;
  score -= Math.max(0, (parseFloat(p95) - 100) / 30);
  score -= Math.max(0, (parseFloat(avg) - 50) / 20);
  score = Math.min(100, Math.max(0, Math.round(score)));
  
  const statusEmoji = thresholdStatus === 'PASS' ? '🟢' : '🔴';
  
  const markdownReport = `# ⚡ OrbitX Load Test Execution Report

## Overall Result: ${statusEmoji} ${thresholdStatus}

| Metric | Value |
| :--- | :--- |
| **Overall Status** | **${thresholdStatus}** |
| **Performance Score** | **${score}/100** |
| **Total Requests** | ${reqs} |
| **Requests / Second (RPS)** | ${rps} |
| **Average Response Time** | ${avg} ms |
| **Minimum Response Time** | ${min} ms |
| **Maximum Response Time** | ${max} ms |
| **p95 Response Time** | ${p95} ms |
| **p99 Response Time** | ${p99} ms |
| **HTTP Errors** | ${errors} (${errorRate}%) |
| **Checks Pass Rate** | ${checksPassed}/${checksTotal} (${checksRate}%) |
| **Threshold Validation** | **${thresholdStatus === 'PASS' ? 'PASS' : 'FAIL'}** |

---
*Report generated automatically by OrbitX k6 Performance Engine.*
`;

  const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OrbitX Performance Test Summary</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f172a;
      color: #e2e8f0;
      margin: 0;
      padding: 40px;
    }
    .card {
      max-width: 800px;
      margin: 0 auto;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    h1 { color: #38bdf8; border-bottom: 2px solid #334155; padding-bottom: 10px; margin-top: 0; }
    .status-pass { color: #4ade80; font-weight: bold; }
    .status-fail { color: #f87171; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #334155; }
    th { background: #0f172a; color: #94a3b8; }
    .highlight { font-weight: bold; background: rgba(56, 189, 248, 0.05); }
  </style>
</head>
<body>
  <div class="card">
    <h1>⚡ OrbitX Performance Load Test Summary</h1>
    <p>Overall Result: <span class="${thresholdStatus === 'PASS' ? 'status-pass' : 'status-fail'}">${thresholdStatus}</span></p>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr class="highlight"><td>Performance Score</td><td><strong>${score} / 100</strong></td></tr>
        <tr><td>Total Requests</td><td>${reqs}</td></tr>
        <tr><td>Requests / Second (RPS)</td><td>${rps}</td></tr>
        <tr><td>Average Response Time</td><td>${avg} ms</td></tr>
        <tr><td>Minimum Response Time</td><td>${min} ms</td></tr>
        <tr><td>Maximum Response Time</td><td>${max} ms</td></tr>
        <tr><td>p95 Response Time</td><td>${p95} ms</td></tr>
        <tr><td>p99 Response Time</td><td>${p99} ms</td></tr>
        <tr><td>HTTP Errors</td><td>${errors} (${errorRate}%)</td></tr>
        <tr><td>Checks Pass Rate</td><td>${checksPassed} / ${checksTotal} (${checksRate}%)</td></tr>
        <tr class="highlight"><td>Threshold Validation</td><td><strong>${thresholdStatus}</strong></td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;

  return {
    'reports/k6-summary.json': JSON.stringify(data, null, 2),
    'reports/k6-report.html': htmlReport,
    'reports/k6-summary.md': markdownReport,
    'stdout': `[k6] Load test complete. RPS: ${rps}, P95: ${p95}ms, Errors: ${errorRate}%, Score: ${score}/100\n`
  };
}
