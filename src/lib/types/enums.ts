export type HealthStatus = "healthy" | "warning" | "degraded" | "critical" | "unknown"
export type Severity = "critical" | "warning" | "degraded" | "info"
export type IncidentStatus = "active" | "investigating" | "acknowledged" | "resolved"
export type AlertStatus = "firing" | "acknowledged" | "resolved"
export type ConnectorStatus = "active" | "warning" | "error" | "inactive"
export type Criticality = "P0" | "P1" | "P2" | "P3"
export type Environment = "Production" | "Staging" | "Development" | "QA"
export type TrendPeriod = "monthly" | "weekly"
export type InsightType = "anomaly" | "prediction" | "correlation" | "optimization" | "capacity" | "risk" | "insight" | "positive" | "info"
export type InsightPriority = "high" | "medium" | "low"
export type RuleOperator = ">" | "<" | ">=" | "<=" | "=="
export type ConnectorCategory = "APM" | "Logs" | "Infra" | "API" | "Database" | "Synthetic" | "Incident" | "Messaging" | "Cloud" | "Custom"
export type SignalStatus = "pass" | "warn" | "fail"
export type NodeType = "api" | "database" | "cache" | "queue" | "external" | "service" | "gateway"
export type DependencyDirection = "upstream" | "downstream"

export const HEALTH_STATUS_MAP: Record<string, HealthStatus> = {
  healthy: "healthy",
  warning: "warning",
  warn: "warning",
  degraded: "degraded",
  critical: "critical",
  unknown: "unknown",
  HEALTHY: "healthy",
  WARNING: "warning",
  DEGRADED: "degraded",
  CRITICAL: "critical",
}

export const SEVERITY_MAP: Record<string, Severity> = {
  critical: "critical",
  CRITICAL: "critical",
  warning: "warning",
  WARNING: "warning",
  warn: "warning",
  degraded: "degraded",
  DEGRADED: "degraded",
  info: "info",
  INFO: "info",
}

export const INCIDENT_STATUS_MAP: Record<string, IncidentStatus> = {
  active: "active",
  ACTIVE: "active",
  investigating: "investigating",
  INVESTIGATING: "investigating",
  acknowledged: "acknowledged",
  ACKNOWLEDGED: "acknowledged",
  resolved: "resolved",
  RESOLVED: "resolved",
}

export const CONNECTOR_STATUS_MAP: Record<string, ConnectorStatus> = {
  active: "active",
  ACTIVE: "active",
  warning: "warning",
  WARNING: "warning",
  error: "error",
  ERROR: "error",
  inactive: "inactive",
  INACTIVE: "inactive",
}

export const CRITICALITY_MAP: Record<string, Criticality> = {
  P0: "P0", p0: "P0",
  P1: "P1", p1: "P1",
  P2: "P2", p2: "P2",
  P3: "P3", p3: "P3",
}

export const ENVIRONMENT_MAP: Record<string, Environment> = {
  production: "Production",
  Production: "Production",
  PRODUCTION: "Production",
  staging: "Staging",
  Staging: "Staging",
  STAGING: "Staging",
  development: "Development",
  Development: "Development",
  dev: "Development",
  DEV: "Development",
  qa: "QA",
  QA: "QA",
}

export function normalizeHealthStatus(raw: string | undefined | null): HealthStatus {
  if (!raw) return "unknown"
  return HEALTH_STATUS_MAP[raw] ?? "unknown"
}

export function normalizeSeverity(raw: string | undefined | null): Severity {
  if (!raw) return "info"
  return SEVERITY_MAP[raw] ?? "warning"
}

export function normalizeIncidentStatus(raw: string | undefined | null): IncidentStatus {
  if (!raw) return "active"
  return INCIDENT_STATUS_MAP[raw] ?? "active"
}

export function normalizeConnectorStatus(raw: string | undefined | null): ConnectorStatus {
  if (!raw) return "inactive"
  return CONNECTOR_STATUS_MAP[raw] ?? "inactive"
}

export function normalizeCriticality(raw: string | undefined | null): Criticality {
  if (!raw) return "P2"
  return CRITICALITY_MAP[raw] ?? "P2"
}

export function normalizeEnvironment(raw: string | undefined | null): Environment {
  if (!raw) return "Production"
  return ENVIRONMENT_MAP[raw] ?? "Production"
}
