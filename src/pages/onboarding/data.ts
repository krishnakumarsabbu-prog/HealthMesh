export const ONBOARDING_STEPS = [
  { id: 0, label: "App Basics", desc: "Name, environment, type" },
  { id: 1, label: "Ownership", desc: "Team, owner, criticality" },
  { id: 2, label: "Select Connectors", desc: "Link data sources" },
  { id: 3, label: "Choose Metrics", desc: "Bind signals" },
  { id: 4, label: "Thresholds", desc: "Configure limits" },
  { id: 5, label: "Assign Weights", desc: "Health score formula" },
  { id: 6, label: "Score Preview", desc: "Simulate health score" },
  { id: 7, label: "Dashboard Preview", desc: "Review layout" },
  { id: 8, label: "Save & Activate", desc: "Go live" },
]

export const AVAILABLE_CONNECTORS = [
  { id: "dd-prod", name: "Datadog (Production)", category: "APM", abbr: "DD", iconBg: "bg-violet-500/10 text-violet-500", status: "active" as const },
  { id: "prom-prod", name: "Prometheus (Production)", category: "Infra", abbr: "PR", iconBg: "bg-orange-500/10 text-orange-500", status: "active" as const },
  { id: "cw-prod", name: "CloudWatch (AWS)", category: "Cloud", abbr: "CW", iconBg: "bg-amber-500/10 text-amber-500", status: "active" as const },
  { id: "pagerduty-prod", name: "PagerDuty", category: "Incident", abbr: "PD", iconBg: "bg-emerald-500/10 text-emerald-500", status: "active" as const },
  { id: "splunk-prod", name: "Splunk Enterprise", category: "Logs", abbr: "SP", iconBg: "bg-green-500/10 text-green-600", status: "warning" as const },
  { id: "synth-prod", name: "Synthetic Health", category: "Synthetic", abbr: "SY", iconBg: "bg-pink-500/10 text-pink-500", status: "active" as const },
]

export type MetricSignal = {
  id: string
  label: string
  connector: string
  type: string
  recommended: boolean
}

export const AVAILABLE_METRICS: MetricSignal[] = [
  { id: "latency_p99", label: "P99 Latency", connector: "Datadog", type: "APM", recommended: true },
  { id: "latency_p95", label: "P95 Latency", connector: "Datadog", type: "APM", recommended: true },
  { id: "error_rate", label: "Error Rate", connector: "Datadog", type: "APM", recommended: true },
  { id: "throughput", label: "Throughput (RPM)", connector: "Datadog", type: "APM", recommended: true },
  { id: "availability", label: "Availability %", connector: "Synthetic", type: "Synthetic", recommended: true },
  { id: "cpu_pct", label: "CPU Utilization %", connector: "Prometheus", type: "Infra", recommended: false },
  { id: "memory_pct", label: "Memory Utilization %", connector: "Prometheus", type: "Infra", recommended: false },
  { id: "pod_restarts", label: "Pod Restarts", connector: "Prometheus", type: "Infra", recommended: false },
  { id: "db_conn_pool", label: "DB Connection Pool", connector: "CloudWatch", type: "Database", recommended: false },
  { id: "incidents_open", label: "Open Incidents", connector: "PagerDuty", type: "Incident", recommended: true },
  { id: "slo_budget", label: "Error Budget Remaining", connector: "Datadog", type: "SLO", recommended: true },
]

export type ThresholdConfig = {
  metricId: string
  label: string
  warnValue: string
  critValue: string
  unit: string
  direction: "above" | "below"
}

export const DEFAULT_THRESHOLDS: ThresholdConfig[] = [
  { metricId: "latency_p99", label: "P99 Latency", warnValue: "300", critValue: "500", unit: "ms", direction: "above" },
  { metricId: "error_rate", label: "Error Rate", warnValue: "0.5", critValue: "1", unit: "%", direction: "above" },
  { metricId: "availability", label: "Availability", warnValue: "99.5", critValue: "99", unit: "%", direction: "below" },
  { metricId: "cpu_pct", label: "CPU Utilization", warnValue: "75", critValue: "90", unit: "%", direction: "above" },
  { metricId: "incidents_open", label: "Open Incidents", warnValue: "1", critValue: "3", unit: "", direction: "above" },
]

export type WeightConfig = {
  label: string
  weight: number
  color: string
}

export const DEFAULT_WEIGHTS: WeightConfig[] = [
  { label: "Latency", weight: 30, color: "#10b981" },
  { label: "Errors", weight: 25, color: "#3b82f6" },
  { label: "Availability", weight: 25, color: "#f59e0b" },
  { label: "Infrastructure", weight: 10, color: "#8b5cf6" },
  { label: "Incidents", weight: 10, color: "#ef4444" },
]

export const RECENT_ONBOARDINGS = [
  { name: "billing-service", team: "Finance", date: "2h ago", status: "complete" as const, score: 91 },
  { name: "content-cdn", team: "Content", date: "1d ago", status: "complete" as const, score: 88 },
  { name: "analytics-pipeline", team: "Data", date: "2d ago", status: "in-progress" as const, score: null },
  { name: "fraud-detection", team: "Security", date: "3d ago", status: "complete" as const, score: 95 },
]
