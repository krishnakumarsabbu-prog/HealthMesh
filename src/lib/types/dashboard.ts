import type { HealthStatus, ConnectorStatus } from "./enums"

export interface DashboardKpiModel {
  totalApps: number
  healthyApps: number
  degradedApps: number
  criticalApps: number
  avgHealthScore: number
  activeIncidents: number
  activeAlerts: number
  overallUptime: number
  avgLatency: number
}

export interface DashboardHealth24hPoint {
  hour: string
  score: number
  incidents: number
  latency: number
}

export interface DashboardTopImpactedApp {
  id: string
  name: string
  score: number
  status: HealthStatus
  trend: number[]
  teamId: string
  latency: number
  uptime: number
  criticality: string
}

export interface DashboardActiveIncident {
  id: string
  title: string
  severity: string
  duration: string
  appName: string
  assignee: string
}

export interface DashboardEnvironmentHealth {
  name: string
  score: number
  status: HealthStatus
  appCount: number
  incidentCount: number
}

export interface DashboardConnectorHealth {
  name: string
  status: ConnectorStatus
  healthPct: number
  category: string
  lastSync: string
}

export interface DashboardAiHighlight {
  id: string
  title: string
  type: string
  priority: string
  appName: string
  confidence: number
}

export interface DashboardHeatmapRow {
  region: string
  production: number
  staging: number
  development: number
}

export interface DashboardOverviewModel extends DashboardKpiModel {
  health24h: DashboardHealth24hPoint[]
  topImpacted: DashboardTopImpactedApp[]
  activeIncidentList: DashboardActiveIncident[]
  environmentHealth: DashboardEnvironmentHealth[]
  connectorHealth: DashboardConnectorHealth[]
  aiHighlights: DashboardAiHighlight[]
  heatmapData: DashboardHeatmapRow[]
}
