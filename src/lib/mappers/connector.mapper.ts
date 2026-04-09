import type { ConnectorInstance, ConnectorTemplate } from "@/lib/api/connectors"
import { safeString, safeNumber, safeArray, normalizeConnectorStatus, normalizeEnvironment } from "./utils"

const ABBR_MAP: Record<string, string> = {
  "Datadog": "DD", "Prometheus": "PR", "AWS CloudWatch": "CW", "Splunk": "SP",
  "AppDynamics": "AD", "Grafana": "GF", "Dynatrace": "DT", "PagerDuty": "PD",
  "Kafka / MQ": "KF", "Database Monitor": "DB", "Synthetic Health": "SY", "LogicMonitor": "LM",
}

const ICON_BG_MAP: Record<string, string> = {
  "Datadog": "bg-orange-500/10 text-orange-500",
  "Prometheus": "bg-red-500/10 text-red-500",
  "AWS CloudWatch": "bg-amber-500/10 text-amber-500",
  "Splunk": "bg-green-500/10 text-green-600",
  "AppDynamics": "bg-blue-500/10 text-blue-500",
  "Grafana": "bg-rose-500/10 text-rose-500",
  "Dynatrace": "bg-teal-500/10 text-teal-500",
  "PagerDuty": "bg-emerald-500/10 text-emerald-500",
  "Kafka / MQ": "bg-slate-500/10 text-slate-500",
  "Database Monitor": "bg-cyan-500/10 text-cyan-500",
  "Synthetic Health": "bg-pink-500/10 text-pink-500",
  "LogicMonitor": "bg-muted text-muted-foreground",
}

const BG_COLOR_MAP: Record<string, string> = {
  "Datadog": "from-orange-500/15 to-orange-500/5",
  "Prometheus": "from-red-500/15 to-red-500/5",
  "AWS CloudWatch": "from-amber-500/15 to-amber-500/5",
  "Splunk": "from-green-500/15 to-green-500/5",
  "AppDynamics": "from-blue-500/15 to-blue-500/5",
  "Grafana": "from-rose-500/15 to-rose-500/5",
  "Dynatrace": "from-teal-500/15 to-teal-500/5",
  "PagerDuty": "from-emerald-500/15 to-emerald-500/5",
  "Kafka / MQ": "from-slate-500/15 to-slate-500/5",
  "Database Monitor": "from-cyan-500/15 to-cyan-500/5",
  "Synthetic Health": "from-pink-500/15 to-pink-500/5",
  "LogicMonitor": "from-muted/15 to-muted/5",
}

const CAPABILITIES_MAP: Record<string, string[]> = {
  "Datadog": ["APM", "Metrics", "Traces", "Logs"],
  "Prometheus": ["Metrics", "Alerting", "Time Series"],
  "AWS CloudWatch": ["Metrics", "Logs", "Events", "Alarms"],
  "Splunk": ["Logs", "Search", "Dashboards", "Alerts"],
  "AppDynamics": ["APM", "Business Transactions", "Server Monitoring"],
  "Grafana": ["Dashboards", "Alerting", "Loki", "Tempo"],
  "Dynatrace": ["APM", "Davis AI", "Infrastructure", "Digital Experience"],
  "PagerDuty": ["Incidents", "Escalations", "On-Call", "Postmortems"],
  "Kafka / MQ": ["Queue Depth", "Consumer Lag", "Throughput", "Latency"],
  "Database Monitor": ["Query Performance", "Connections", "Replication", "Locks"],
  "Synthetic Health": ["HTTP Probes", "SLA Tracking", "Geo Tests", "Flow Tests"],
  "LogicMonitor": ["Infrastructure", "Network", "Cloud", "Logs"],
}

const DESCRIPTIONS_MAP: Record<string, string> = {
  "Datadog": "Full-stack observability platform with APM, infrastructure metrics, and log management",
  "Prometheus": "Open-source systems monitoring and alerting toolkit with multi-dimensional data model",
  "AWS CloudWatch": "AWS native observability service for resources, applications, and services",
  "Splunk": "Enterprise data platform for log aggregation, search, and operational intelligence",
  "AppDynamics": "Application performance management with business transaction monitoring",
  "Grafana": "Open-source visualization and monitoring platform with multi-source dashboard support",
  "Dynatrace": "AI-powered observability platform with automatic full-stack discovery",
  "PagerDuty": "Digital operations management platform for incident response and on-call scheduling",
  "Kafka / MQ": "Real-time message queue monitoring for Kafka clusters with consumer lag alerting",
  "Database Monitor": "Deep database observability for Postgres, MySQL, and MongoDB",
  "Synthetic Health": "Proactive synthetic monitoring for APIs and user flows with global test locations",
  "LogicMonitor": "Infrastructure monitoring platform with automated device discovery",
}

function connectorAbbr(name: string): string {
  return ABBR_MAP[name] || name.slice(0, 2).toUpperCase()
}
function connectorIconBg(name: string): string {
  return ICON_BG_MAP[name] || "bg-muted text-muted-foreground"
}
function connectorBgColor(name: string): string {
  return BG_COLOR_MAP[name] || "from-slate-500/15 to-slate-500/5"
}

export interface ConnectorInstanceModel {
  id: string; templateId: string; name: string; category: string
  status: string; environment: string; version: string; lastSync: string
  healthScore: number; appsConnected: number; usageCount: number
  capabilities: string[]; description: string
  abbr: string; iconBg: string; bgColor: string
  config: Record<string, string>
}

export function mapConnectorInstance(a: ConnectorInstance): ConnectorInstanceModel {
  const name = safeString(a.template_id)
  return {
    id: safeString(a.id),
    templateId: name,
    name: safeString(a.name),
    category: safeString(a.category, "APM"),
    status: normalizeConnectorStatus(a.status),
    environment: normalizeEnvironment(a.environment),
    version: safeString(a.version),
    lastSync: safeString(a.last_sync, "—"),
    healthScore: safeNumber(a.health_pct),
    appsConnected: safeNumber(a.app_count),
    usageCount: 0,
    capabilities: CAPABILITIES_MAP[name] ?? [],
    description: DESCRIPTIONS_MAP[name] ?? "",
    abbr: connectorAbbr(name),
    iconBg: connectorIconBg(name),
    bgColor: connectorBgColor(name),
    config: (a.config as Record<string, string>) ?? {},
  }
}

export interface ConnectorTemplateModel {
  id: string; name: string; category: string; description: string
  version: string; capabilities: string[]; popular: boolean
  abbr: string; iconBg: string; bgColor: string
  fields: Array<{ key: string; label: string; type: string; required: boolean }>
}

export function mapConnectorTemplate(t: ConnectorTemplate): ConnectorTemplateModel {
  const name = safeString(t.name)
  return {
    id: safeString(t.id),
    name,
    category: safeString(t.category, "APM"),
    description: safeString(t.description, DESCRIPTIONS_MAP[name] ?? ""),
    version: safeString(t.version, "latest"),
    capabilities: CAPABILITIES_MAP[name] ?? safeArray(t.capabilities),
    popular: t.popular ?? false,
    abbr: connectorAbbr(name),
    iconBg: connectorIconBg(name),
    bgColor: connectorBgColor(name),
    fields: safeArray(t.fields).map(f => ({
      key: safeString(f.key),
      label: safeString(f.label),
      type: safeString(f.type, "text"),
      required: f.required ?? false,
    })),
  }
}

