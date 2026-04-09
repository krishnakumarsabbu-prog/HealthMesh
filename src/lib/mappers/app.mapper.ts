import type {
  AppSummary, AppOverview, AppSignal, AppTransaction, AppLogPattern,
  AppInfraPod, AppDependency, AppEndpoint, AppIncident, AppHealthRule,
  AppAiInsight, AppConfiguration,
} from "@/lib/api/apps"
import {
  safeString, safeNumber, safeArray, parseNumeric,
  normalizeHealthStatus, normalizeSeverity, normalizeIncidentStatus, normalizeEnvironment,
  formatRelativeTime,
} from "./utils"

export interface AppSummaryModel {
  id: string; name: string; description: string
  teamId: string; teamName: string; environment: string
  status: string; criticality: string
  healthScore: number; uptime: number; latencyP99: number; rpm: number
  appType: string; runtime: string; version: string; platform: string
  tags: string[]; incidentCount: number; dependencyCount: number; connectorCount: number
  trend: number[]; ownerName: string
}

export function mapAppSummary(a: AppSummary): AppSummaryModel {
  return {
    id: safeString(a.id),
    name: safeString(a.name),
    description: safeString(a.description),
    teamId: safeString(a.team_id),
    teamName: safeString(a.owner_name) || safeString(a.team_id),
    environment: normalizeEnvironment(a.environment),
    status: normalizeHealthStatus(a.status),
    criticality: safeString(a.criticality, "P1"),
    healthScore: safeNumber(a.health_score),
    uptime: safeNumber(a.uptime, 100),
    latencyP99: safeNumber(a.latency_p99),
    rpm: safeNumber(a.rpm),
    appType: safeString(a.app_type, "Service"),
    runtime: safeString(a.runtime),
    version: safeString(a.version),
    platform: safeString(a.platform),
    tags: safeArray(a.tags),
    incidentCount: safeNumber(a.incident_count),
    dependencyCount: safeNumber(a.dependency_count),
    connectorCount: safeNumber(a.connector_count),
    trend: safeArray(a.trend),
    ownerName: safeString(a.owner_name),
  }
}

export interface AppOverviewModel {
  app: AppSummaryModel
  healthHistory: Array<{ label: string; score: number }>
  latency24h: Array<{ t: string; p50: number; p95: number; p99: number }>
  throughput24h: Array<{ t: string; rpm: number }>
  errorRate24h: Array<{ t: string; rate: number }>
}

export function mapAppOverview(o: AppOverview): AppOverviewModel {
  return {
    app: mapAppSummary(o.app),
    healthHistory: safeArray(o.health_history).map(h => ({
      label: safeString(h.label),
      score: safeNumber(h.score),
    })),
    latency24h: safeArray(o.latency_24h).map(h => ({
      t: safeString(h.t),
      p50: safeNumber(h.p50),
      p95: safeNumber(h.p95),
      p99: safeNumber(h.p99),
    })),
    throughput24h: safeArray(o.throughput_24h).map(h => ({
      t: safeString(h.t),
      rpm: safeNumber(h.rpm),
    })),
    errorRate24h: safeArray(o.error_rate_24h).map(h => ({
      t: safeString(h.t),
      rate: safeNumber(h.rate),
    })),
  }
}

export interface AppSignalModel {
  id: number; appId: string; category: string; name: string
  value: string; unit: string; status: string; trend: string; delta: string; source: string
}

export function mapAppSignal(s: AppSignal): AppSignalModel {
  return {
    id: s.id,
    appId: safeString(s.app_id),
    category: safeString(s.category),
    name: safeString(s.name),
    value: safeString(s.value),
    unit: safeString(s.unit),
    status: normalizeHealthStatus(s.status),
    trend: safeString(s.trend),
    delta: safeString(s.delta),
    source: safeString(s.source),
  }
}

export interface AppTransactionModel {
  id: number; appId: string; endpoint: string
  rpm: number; latencyP99: number; errorRate: number; apdex: number; status: string
}

export function mapAppTransaction(t: AppTransaction): AppTransactionModel {
  return {
    id: t.id,
    appId: safeString(t.app_id),
    endpoint: safeString(t.endpoint),
    rpm: safeNumber(t.rpm),
    latencyP99: safeNumber(t.latency_p99),
    errorRate: safeNumber(t.error_rate),
    apdex: safeNumber(t.apdex),
    status: normalizeHealthStatus(t.status),
  }
}

export interface AppLogPatternModel {
  id: number; appId: string; level: string; pattern: string
  count: number; firstSeen: string; lastSeen: string
}

export function mapAppLogPattern(l: AppLogPattern): AppLogPatternModel {
  return {
    id: l.id,
    appId: safeString(l.app_id),
    level: safeString(l.level, "info"),
    pattern: safeString(l.message),
    count: safeNumber(l.count),
    firstSeen: formatRelativeTime(l.first_seen) || safeString(l.first_seen, "—"),
    lastSeen: formatRelativeTime(l.last_seen) || safeString(l.last_seen, "—"),
  }
}

export interface AppInfraPodModel {
  id: number; appId: string; podName: string; node: string
  cpuPct: number; memPct: number; restarts: number; age: string; status: string
}

export function mapAppInfraPod(p: AppInfraPod): AppInfraPodModel {
  return {
    id: p.id,
    appId: safeString(p.app_id),
    podName: safeString(p.pod_name),
    node: safeString(p.node),
    cpuPct: safeNumber(p.cpu_pct),
    memPct: safeNumber(p.mem_pct),
    restarts: safeNumber(p.restarts),
    age: safeString(p.age, "—"),
    status: normalizeHealthStatus(p.status),
  }
}

export interface AppDependencyModel {
  id: number; appId: string; name: string; depType: string
  status: string; latencyMs: number; errorRate: number
}

export function mapAppDependency(d: AppDependency): AppDependencyModel {
  return {
    id: d.id,
    appId: safeString(d.app_id),
    name: safeString(d.dep_name),
    depType: safeString(d.dep_type),
    status: normalizeHealthStatus(d.status),
    latencyMs: parseNumeric(d.latency),
    errorRate: parseNumeric(d.error_rate),
  }
}

export interface AppEndpointModel {
  id: number; appId: string; method: string; path: string
  status: string; rpm: number; latencyP99: number; errorRate: number
  version: string; auth: string
}

export function mapAppEndpoint(e: AppEndpoint): AppEndpointModel {
  return {
    id: e.id,
    appId: safeString(e.app_id),
    method: safeString(e.method, "GET"),
    path: safeString(e.path),
    status: normalizeHealthStatus(e.status),
    rpm: safeNumber(e.rpm),
    latencyP99: safeNumber(e.latency_p99),
    errorRate: safeNumber(e.error_rate),
    version: safeString(e.version),
    auth: safeString(e.auth),
  }
}

export interface AppIncidentModel {
  id: string; appId: string; appName: string; title: string
  severity: string; status: string; duration: string
  assignee: string; aiCause: string; healthImpact: number
  affectedDeps: string[]
  timeline: Array<{ time: string; event: string; type: string }>
  startedAt: string; resolvedAt: string | null
}

export function mapAppIncident(i: AppIncident): AppIncidentModel {
  return {
    id: safeString(i.id),
    appId: safeString(i.app_id),
    appName: safeString(i.app_name),
    title: safeString(i.title),
    severity: normalizeSeverity(i.severity),
    status: normalizeIncidentStatus(i.status),
    duration: safeString(i.duration, "—"),
    assignee: safeString(i.assignee, "Unassigned"),
    aiCause: safeString(i.ai_cause, "Under investigation"),
    healthImpact: parseInt(safeString(i.health_impact, "0")) || 0,
    affectedDeps: safeArray(i.affected_deps),
    timeline: safeArray(i.timeline).map(ev => ({
      time: safeString(ev.time),
      event: safeString(ev.event),
      type: safeString(ev.type, "update"),
    })),
    startedAt: safeString(i.started_at),
    resolvedAt: i.resolved_at || null,
  }
}

export interface AppHealthRuleModel {
  id: string; name: string; metric: string; operator: string
  threshold: number; condition: string; severity: string; enabled: boolean
  scope: string; triggerCount: number; tags: string[]
  version: number; lastTriggered: string; description: string; weight: number
}

export function mapAppHealthRule(r: AppHealthRule): AppHealthRuleModel {
  return {
    id: safeString(r.id),
    name: safeString(r.name),
    metric: safeString(r.metric),
    operator: safeString(r.operator, ">"),
    threshold: safeNumber(r.threshold),
    condition: `${r.operator ?? ">"} ${r.threshold ?? 0}`,
    severity: normalizeSeverity(r.severity),
    enabled: r.enabled ?? true,
    scope: safeString(r.scope, "global"),
    triggerCount: safeNumber(r.trigger_count),
    tags: safeArray(r.tags),
    version: safeNumber(r.version, 1),
    lastTriggered: formatRelativeTime(r.last_triggered) || safeString(r.last_triggered, "never"),
    description: safeString(r.description),
    weight: safeNumber(r.weight),
  }
}

export interface AppAiInsightModel {
  id: string; type: string; priority: string; title: string
  description: string; confidence: number; impact: string
  recommendation: string; signals: string[]; whatChanged: string; age: string
}

export function mapAppAiInsight(i: AppAiInsight): AppAiInsightModel {
  return {
    id: safeString(i.id),
    type: safeString(i.insight_type, "info"),
    priority: safeString(i.priority, "low"),
    title: safeString(i.title),
    description: safeString(i.description),
    confidence: safeNumber(i.confidence),
    impact: safeString(i.impact),
    recommendation: safeString(i.recommendation),
    signals: safeArray(i.signals),
    whatChanged: safeString(i.what_changed),
    age: formatRelativeTime(i.generated_at) || "recently",
  }
}

export interface AppConfigurationModel {
  appId: string; name: string; runtime: string; version: string
  platform: string; environment: string; criticality: string; tags: string[]
  ownerName: string
  connectors: Array<{ id: string; name: string; category: string; status: string }>
  healthWeights: { latency: number; errors: number; availability: number; infra: number; incidents: number }
  thresholds: { latencyWarn: number; latencyCrit: number; errorRateWarn: number; errorRateCrit: number }
}

export function mapAppConfiguration(c: AppConfiguration): AppConfigurationModel {
  return {
    appId: safeString(c.app_id),
    name: safeString(c.name),
    runtime: safeString(c.runtime),
    version: safeString(c.version),
    platform: safeString(c.platform),
    environment: normalizeEnvironment(c.environment),
    criticality: safeString(c.criticality, "P1"),
    tags: safeArray(c.tags),
    ownerName: safeString(c.owner_name),
    connectors: safeArray(c.connectors).map(conn => ({
      id: safeString(conn.id),
      name: safeString(conn.name),
      category: safeString(conn.category),
      status: normalizeConnectorStatus(conn.status),
    })),
    healthWeights: {
      latency: safeNumber(c.health_weights?.latency, 25),
      errors: safeNumber(c.health_weights?.errors, 25),
      availability: safeNumber(c.health_weights?.availability, 25),
      infra: safeNumber(c.health_weights?.infra, 15),
      incidents: safeNumber(c.health_weights?.incidents, 10),
    },
    thresholds: {
      latencyWarn: safeNumber(c.thresholds?.latency_warn, 300),
      latencyCrit: safeNumber(c.thresholds?.latency_crit, 1000),
      errorRateWarn: safeNumber(c.thresholds?.error_rate_warn, 1),
      errorRateCrit: safeNumber(c.thresholds?.error_rate_crit, 5),
    },
  }
}

function normalizeConnectorStatus(raw: string | null | undefined): string {
  if (!raw) return "inactive"
  const map: Record<string, string> = {
    active: "active", healthy: "active", connected: "active", ok: "active",
    warning: "warning", degraded: "warning",
    error: "error", failed: "error", disconnected: "error",
    inactive: "inactive", disabled: "inactive",
  }
  return map[raw.toLowerCase()] ?? "inactive"
}
