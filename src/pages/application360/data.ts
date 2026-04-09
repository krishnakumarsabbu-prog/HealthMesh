export const APP_OPTIONS = [
  { value: "payments-api", label: "payments-api", team: "Payments", lang: "Node.js 20", version: "v2.14.1", runtime: "Kubernetes", type: "API", score: 94, status: "healthy" as const, criticality: "P0" },
  { value: "customer-auth", label: "customer-auth", team: "Identity", lang: "Go 1.22", version: "v4.2.0", runtime: "Kubernetes", type: "API", score: 71, status: "warning" as const, criticality: "P0" },
  { value: "order-gateway", label: "order-gateway", team: "Commerce", lang: "Java 21", version: "v3.8.2", runtime: "ECS", type: "Gateway", score: 88, status: "healthy" as const, criticality: "P1" },
  { value: "search-api", label: "search-api", team: "Discovery", lang: "Python 3.12", version: "v1.9.5", runtime: "Kubernetes", type: "API", score: 55, status: "critical" as const, criticality: "P1" },
]

export const LATENCY_24H = Array.from({ length: 48 }, (_, i) => ({
  time: `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
  p50: Math.round(32 + Math.sin(i * 0.3) * 8 + Math.random() * 5),
  p95: Math.round(68 + Math.sin(i * 0.3) * 18 + Math.random() * 12),
  p99: Math.round(110 + Math.sin(i * 0.3) * 35 + Math.random() * 20),
}))

export const THROUGHPUT_24H = Array.from({ length: 48 }, (_, i) => ({
  time: `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
  rpm: Math.round(9800 + Math.sin(i * 0.25) * 2200 + Math.random() * 800),
}))

export const ERROR_RATE_24H = Array.from({ length: 48 }, (_, i) => ({
  time: `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
  rate: Math.max(0, parseFloat((0.4 + Math.cos(i * 0.5) * 0.25 + Math.random() * 0.3).toFixed(3))),
}))

export const HEALTH_SCORE_7D = Array.from({ length: 28 }, (_, i) => ({
  label: `D${i + 1}`,
  score: Math.min(100, Math.max(80, 93 + Math.sin(i * 0.35) * 5 + (Math.random() - 0.5) * 4)),
}))

export const SIGNALS = [
  { source: "APM", metric: "P99 Latency", value: "42ms", threshold: "< 500ms", status: "pass" as const, delta: "-8ms", icon: "zap" },
  { source: "APM", metric: "Error Rate", value: "0.04%", threshold: "< 1%", status: "pass" as const, delta: "-0.02%", icon: "activity" },
  { source: "APM", metric: "Throughput", value: "12.4K rpm", threshold: "> 5K rpm", status: "pass" as const, delta: "+1.1K", icon: "bar-chart" },
  { source: "Infra", metric: "CPU Utilization", value: "62%", threshold: "< 90%", status: "pass" as const, delta: "+4%", icon: "cpu" },
  { source: "Infra", metric: "Memory", value: "71%", threshold: "< 85%", status: "warn" as const, delta: "+12%", icon: "memory-stick" },
  { source: "Infra", metric: "Pod Restarts", value: "2", threshold: "< 5 / 1h", status: "pass" as const, delta: "0", icon: "refresh-cw" },
  { source: "Synthetic", metric: "Checkout Flow", value: "1.2s", threshold: "< 3s", status: "pass" as const, delta: "-0.1s", icon: "monitor" },
  { source: "Synthetic", metric: "Login Ping", value: "210ms", threshold: "< 500ms", status: "pass" as const, delta: "+10ms", icon: "wifi" },
  { source: "Database", metric: "Query P99", value: "8ms", threshold: "< 50ms", status: "pass" as const, delta: "-1ms", icon: "database" },
  { source: "Database", metric: "Connection Pool", value: "74%", threshold: "< 80%", status: "warn" as const, delta: "+18%", icon: "link" },
  { source: "API", metric: "SLO Error Budget", value: "82%", threshold: "> 50%", status: "pass" as const, delta: "-3%", icon: "shield" },
  { source: "API", metric: "Availability", value: "99.98%", threshold: "> 99.9%", status: "pass" as const, delta: "+0.01%", icon: "check-circle" },
]

export const TRANSACTIONS = [
  { name: "POST /v2/payments/charge", rpm: 4820, p99: 38, errors: 0.02, apdex: 0.98, status: "healthy" as const },
  { name: "GET /v2/payments/status/:id", rpm: 3210, p99: 22, errors: 0.00, apdex: 0.99, status: "healthy" as const },
  { name: "POST /v2/payments/refund", rpm: 890, p99: 91, errors: 0.12, apdex: 0.91, status: "healthy" as const },
  { name: "GET /v2/payments/history", rpm: 1740, p99: 155, errors: 0.31, apdex: 0.85, status: "warning" as const },
  { name: "POST /v2/payments/validate", rpm: 6400, p99: 18, errors: 0.00, apdex: 0.99, status: "healthy" as const },
  { name: "GET /v2/payments/methods", rpm: 2100, p99: 445, errors: 1.20, apdex: 0.62, status: "critical" as const },
]

export const LOG_PATTERNS = [
  { level: "ERROR", pattern: "ConnectionRefusedError: redis://payments-cache:6379", count: 23, first: "14:22", last: "14:51", trend: "up" },
  { level: "WARN", pattern: "Slow query detected: SELECT * FROM payment_ledger WHERE …", count: 88, first: "11:00", last: "14:55", trend: "stable" },
  { level: "ERROR", pattern: "UnhandledPromiseRejection: payment gateway timeout after 5000ms", count: 4, first: "13:18", last: "13:42", trend: "down" },
  { level: "WARN", pattern: "Retry attempt 3/3 for transaction TX-88821", count: 17, first: "12:30", last: "14:50", trend: "up" },
  { level: "INFO", pattern: "Rate limit applied: client_id=stripe-webhook (threshold: 100/s)", count: 312, first: "08:00", last: "14:55", trend: "stable" },
]

export const INFRA_PODS = [
  { name: "payments-api-d8f9b-xk2p1", node: "node-03", cpu: 58, mem: 69, restarts: 0, status: "running" as const, age: "12d" },
  { name: "payments-api-d8f9b-r7w4n", node: "node-05", cpu: 71, mem: 74, restarts: 1, status: "running" as const, age: "12d" },
  { name: "payments-api-d8f9b-tz8mn", node: "node-02", cpu: 44, mem: 68, restarts: 0, status: "running" as const, age: "12d" },
  { name: "payments-api-d8f9b-vq2xs", node: "node-04", cpu: 88, mem: 81, restarts: 2, status: "warning" as const, age: "3h" },
]

export const ENDPOINTS = [
  { path: "/v2/payments/charge", method: "POST", latency: 38, avail: 99.98, errorPct: 0.02, rpm: 4820, status: "healthy" as const },
  { path: "/v2/payments/status/:id", method: "GET", latency: 22, avail: 99.99, errorPct: 0.00, rpm: 3210, status: "healthy" as const },
  { path: "/v2/payments/refund", method: "POST", latency: 91, avail: 99.91, errorPct: 0.12, rpm: 890, status: "healthy" as const },
  { path: "/v2/payments/history", method: "GET", latency: 155, avail: 99.72, errorPct: 0.31, rpm: 1740, status: "warning" as const },
  { path: "/v2/payments/methods", method: "GET", latency: 445, avail: 98.80, errorPct: 1.20, rpm: 2100, status: "critical" as const },
  { path: "/v2/payments/validate", method: "POST", latency: 18, avail: 99.99, errorPct: 0.00, rpm: 6400, status: "healthy" as const },
]

export const DEPENDENCIES = [
  { name: "order-gateway", direction: "upstream", latency: 12, status: "healthy" as const, rpm: 8400, errorPct: 0.01 },
  { name: "fraud-detection", direction: "downstream", latency: 34, status: "healthy" as const, rpm: 4820, errorPct: 0.05 },
  { name: "payments-db (Postgres)", direction: "downstream", latency: 8, status: "healthy" as const, rpm: 14200, errorPct: 0.00 },
  { name: "payments-cache (Redis)", direction: "downstream", latency: 1, status: "warning" as const, rpm: 22000, errorPct: 0.18 },
  { name: "stripe-gateway", direction: "downstream", latency: 180, status: "healthy" as const, rpm: 4820, errorPct: 0.04 },
  { name: "notification-engine", direction: "downstream", latency: 25, status: "healthy" as const, rpm: 1200, errorPct: 0.00 },
]

export const INCIDENTS = [
  { id: "INC-2891", title: "P95 latency spike on /payments/charge", severity: "warning" as const, opened: "2h ago", duration: "12m", status: "resolved", assignee: "sarah.chen" },
  { id: "INC-2844", title: "Redis connection pool exhaustion", severity: "critical" as const, opened: "1d ago", duration: "8m", status: "resolved", assignee: "auto-remediated" },
  { id: "INC-2801", title: "GET /payments/methods degradation", severity: "warning" as const, opened: "3d ago", duration: "22m", status: "resolved", assignee: "mark.santos" },
  { id: "INC-2755", title: "Stripe gateway timeout (batch)", severity: "warning" as const, opened: "5d ago", duration: "4m", status: "resolved", assignee: "auto-remediated" },
]

export const HEALTH_RULES = [
  { name: "P99 Latency SLO", condition: "> 500ms for 5min", weight: 30, current: "42ms", status: "pass" as const },
  { name: "Error Rate Threshold", condition: "> 1% for 3min", weight: 25, current: "0.04%", status: "pass" as const },
  { name: "Availability SLO", condition: "< 99.9% in 5min", weight: 25, current: "99.98%", status: "pass" as const },
  { name: "Memory Pressure", condition: "> 85%", weight: 10, current: "71%", status: "pass" as const },
  { name: "Connection Pool", condition: "> 80% capacity", weight: 10, current: "74%", status: "warn" as const },
]

export const AI_FINDINGS = [
  { type: "risk", title: "Redis connection pool approaching limit", body: "Pool utilization has increased 18% in the last 2 hours, trending toward the 80% warning threshold. Two prior incidents (INC-2844, INC-2801) originated from this same pattern.", confidence: 91 },
  { type: "insight", title: "GET /payments/methods latency regression", body: "P99 latency on this endpoint has increased from 180ms to 445ms since deploy v2.14.0 (3 days ago). The change correlates with the introduction of a new database join in the payment method resolver.", confidence: 86 },
  { type: "positive", title: "P99 Latency improving after v2.14.1", body: "Since last night's deploy, overall P99 latency has decreased by 22ms. No new incidents have been triggered in the last 14 hours.", confidence: 97 },
  { type: "info", title: "Traffic pattern shift detected", body: "Throughput on POST /payments/charge has grown 34% week-over-week. Current headroom is adequate, but auto-scaling thresholds should be reviewed if trend continues.", confidence: 78 },
]
