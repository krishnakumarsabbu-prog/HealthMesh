import type { HealthStatus, Criticality, Environment } from "./enums"

export interface AppSummaryModel {
  id: string
  name: string
  description: string
  teamId: string
  teamName: string
  environment: Environment
  status: HealthStatus
  criticality: Criticality
  healthScore: number
  uptime: number
  latencyP99: number
  rpm: number
  appType: string
  runtime: string
  version: string
  platform: string
  tags: string[]
  incidentCount: number
  dependencyCount: number
  connectorCount: number
  trend: number[]
  ownerName: string
  lastRefresh: string
  failingChecks: number
}

export interface AppSignalModel {
  id: number
  appId: string
  category: string
  name: string
  value: string
  unit: string
  status: "pass" | "warn" | "fail"
  trend: string
  delta: string
  source: string
  threshold: string
  icon: string
}

export interface AppTransactionModel {
  id: number
  appId: string
  name: string
  rpm: number
  latencyP99: number
  errorRate: number
  apdex: number
  status: HealthStatus
}

export interface AppLogPatternModel {
  id: number
  appId: string
  level: "ERROR" | "WARN" | "INFO"
  pattern: string
  count: number
  firstSeen: string
  lastSeen: string
  trend: "up" | "down" | "stable"
}

export interface AppInfraPodModel {
  id: number
  appId: string
  podName: string
  node: string
  cpuPct: number
  memPct: number
  restarts: number
  age: string
  status: "running" | "warning" | "failed" | "pending"
}

export interface AppDependencyModel {
  id: number
  appId: string
  name: string
  type: string
  direction: "upstream" | "downstream"
  status: HealthStatus
  latencyMs: number
  errorRate: number
  rpm: number
}

export interface AppEndpointModel {
  id: number
  appId: string
  method: string
  path: string
  status: HealthStatus
  rpm: number
  latencyP99: number
  errorRate: number
  availability: number
  version: string
  auth: string
}

export interface IncidentTimelineEvent {
  time: string
  event: string
  type: string
}

export interface AppIncidentModel {
  id: string
  appId: string
  appName: string
  title: string
  severity: string
  status: string
  duration: string
  age: string
  assignee: string
  owner: string
  aiCause: string
  description: string
  healthImpact: number
  affectedDeps: string[]
  affectedApps: string[]
  sources: string[]
  timeline: IncidentTimelineEvent[]
  startedAt: string
  resolvedAt: string
}

export interface AppHealthRuleModel {
  id: string
  name: string
  metric: string
  operator: string
  threshold: number
  severity: string
  enabled: boolean
  scope: string
  triggerCount: number
  tags: string[]
  version: number
  lastTriggered: string
  description: string
  weight: number
  condition: string
  currentValue: string
  status: "pass" | "warn" | "fail"
}

export interface AppAiInsightModel {
  id: string
  appId: string
  appName: string
  insightType: string
  priority: string
  title: string
  description: string
  confidence: number
  impact: string
  recommendation: string
  signals: string[]
  whatChanged: string
  generatedAt: string
  age: string
}

export interface AppConfigurationModel {
  appId: string
  name: string
  runtime: string
  version: string
  platform: string
  environment: Environment
  criticality: Criticality
  tags: string[]
  ownerName: string
  connectors: Array<{ id: string; name: string; category: string; status: string; abbr: string; iconBg: string }>
  healthWeights: {
    latency: number
    errors: number
    availability: number
    infra: number
    incidents: number
  }
  thresholds: {
    latencyWarn: number
    latencyCrit: number
    errorRateWarn: number
    errorRateCrit: number
  }
}

export interface AppOverviewModel {
  app: AppSummaryModel
  healthHistory: Array<{ label: string; score: number }>
  latency24h: Array<{ t: string; p50: number; p95: number; p99: number }>
  throughput24h: Array<{ t: string; rpm: number }>
  errorRate24h: Array<{ t: string; rate: number }>
}
