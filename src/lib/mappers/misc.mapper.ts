import type {
  AiInsight, TrendDataPoint, DependencyNode, DependencyEdge,
  DependencyMap, HealthRule,
} from "@/lib/api/misc"
import type { Incident, Alert } from "@/lib/api/incidents"
import {
  safeString, safeNumber, safeArray, parseNumeric,
  normalizeHealthStatus, normalizeSeverity, normalizeIncidentStatus,
  formatRelativeTime,
} from "./utils"

export interface AiInsightModel {
  id: string; appId: string; appName: string
  type: string; priority: string; title: string
  description: string; confidence: number; impact: string
  recommendation: string; signals: string[]
  whatChanged: string; age: string
}

export function mapAiInsight(a: AiInsight): AiInsightModel {
  return {
    id: safeString(a.id),
    appId: safeString(a.app_id ?? ""),
    appName: safeString(a.app_name),
    type: safeString(a.insight_type, "info"),
    priority: safeString(a.priority, "low"),
    title: safeString(a.title),
    description: safeString(a.description),
    confidence: safeNumber(a.confidence),
    impact: safeString(a.impact),
    recommendation: safeString(a.recommendation),
    signals: safeArray(a.signals),
    whatChanged: safeString(a.what_changed),
    age: formatRelativeTime(a.generated_at) || "recently",
  }
}

export interface TrendDataPointModel {
  label: string; healthScore: number; availability: number
  incidents: number; latency: number; errorRate: number; mttr: number; mttd: number
}

export function mapTrendDataPoint(d: TrendDataPoint): TrendDataPointModel {
  return {
    label: safeString(d.label),
    healthScore: safeNumber(d.health_score),
    availability: safeNumber(d.availability, 100),
    incidents: safeNumber(d.incidents),
    latency: safeNumber(d.latency),
    errorRate: safeNumber(d.error_rate),
    mttr: safeNumber(d.mttr),
    mttd: safeNumber(d.mttd),
  }
}

export interface DependencyNodeModel {
  id: string; label: string; nodeType: string; status: string
  latency: number; errorRate: number; rps: number; uptime: number
  version: string; team: string; x: number; y: number
}

export function mapDependencyNode(n: DependencyNode): DependencyNodeModel {
  const nodeTypeMap: Record<string, string> = {
    api: "api", service: "service", database: "database", db: "database",
    cache: "cache", redis: "cache", queue: "queue", kafka: "queue",
    external: "external", gateway: "gateway", ml: "ml",
  }
  return {
    id: safeString(n.id),
    label: safeString(n.label),
    nodeType: nodeTypeMap[n.node_type?.toLowerCase() ?? ""] ?? "service",
    status: normalizeHealthStatus(n.status),
    latency: parseNumeric(n.latency),
    errorRate: parseNumeric(n.error_rate),
    rps: parseNumeric(n.rps),
    uptime: parseNumeric(n.uptime, 100),
    version: safeString(n.version),
    team: safeString(n.team),
    x: safeNumber(n.x),
    y: safeNumber(n.y),
  }
}

export interface DependencyEdgeModel {
  id: string; sourceId: string; targetId: string
  status: string; latency: number; label: string
}

export function mapDependencyEdge(e: DependencyEdge): DependencyEdgeModel {
  return {
    id: String(e.id ?? ""),
    sourceId: safeString(e.source_id),
    targetId: safeString(e.target_id),
    status: normalizeHealthStatus(e.status),
    latency: parseNumeric(e.latency),
    label: safeString(e.label),
  }
}

export interface DependencyMapModel {
  nodes: DependencyNodeModel[]
  edges: DependencyEdgeModel[]
  stats: { totalServices: number; totalConnections: number; degradedPaths: number; criticalNodes: number }
}

export function mapDependencyMap(m: DependencyMap): DependencyMapModel {
  return {
    nodes: safeArray(m.nodes).map(mapDependencyNode),
    edges: safeArray(m.edges).map(mapDependencyEdge),
    stats: {
      totalServices: safeNumber(m.stats?.total_services),
      totalConnections: safeNumber(m.stats?.total_connections),
      degradedPaths: safeNumber(m.stats?.degraded_paths),
      criticalNodes: safeNumber(m.stats?.critical_nodes),
    },
  }
}

export interface HealthRuleModel {
  id: string; name: string; metric: string; operator: string
  threshold: number; condition: string; severity: string; enabled: boolean
  scope: string; triggerCount: number; tags: string[]
  version: number; lastTriggered: string; description: string
}

export function mapHealthRule(r: HealthRule): HealthRuleModel {
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
  }
}

export interface IncidentModel {
  id: string; appId: string; appName: string; title: string
  severity: string; status: string; age: string
  owner: string; assignee: string; description: string; aiCause: string
  healthImpact: number; affectedDeps: string[]
  timeline: Array<{ time: string; event: string; type: string }>
  startedAt: string; resolvedAt: string | null
}

export function mapIncident(i: Incident): IncidentModel {
  return {
    id: safeString(i.id),
    appId: safeString(i.app_id ?? ""),
    appName: safeString(i.app_name),
    title: safeString(i.title),
    severity: normalizeSeverity(i.severity),
    status: normalizeIncidentStatus(i.status),
    age: safeString(i.duration) || formatRelativeTime(i.started_at) || "—",
    owner: "",
    assignee: safeString(i.assignee, "Unassigned"),
    description: safeString(i.ai_cause, "Investigation in progress."),
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

export interface AlertModel {
  id: string; appId: string; appName: string; ruleName: string
  metric: string; severity: string; status: string
  source: string; firedAt: string
}

export function mapAlert(a: Alert): AlertModel {
  return {
    id: safeString(a.id),
    appId: safeString(a.app_id ?? ""),
    appName: safeString(a.app_name),
    ruleName: safeString(a.rule_name),
    metric: safeString(a.metric),
    severity: normalizeSeverity(a.severity),
    status: safeString(a.status, "firing"),
    source: safeString(a.environment),
    firedAt: formatRelativeTime(a.fired_at) || safeString(a.fired_at, "—"),
  }
}
