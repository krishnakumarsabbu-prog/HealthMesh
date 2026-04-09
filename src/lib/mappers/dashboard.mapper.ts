import type { DashboardOverview } from "@/lib/api/dashboard"
import {
  safeNumber, safeString, safeArray,
  normalizeHealthStatus, normalizeSeverity, normalizeConnectorStatus,
  formatRelativeTime,
} from "./utils"

export interface DashboardOverviewModel {
  totalApps: number
  healthyApps: number
  degradedApps: number
  criticalApps: number
  avgHealthScore: number
  activeIncidents: number
  activeAlerts: number
  overallUptime: number
  avgLatency: number
  health24h: Array<{ hour: string; score: number; incidents: number }>
  topImpacted: Array<{
    id: string; name: string; score: number; status: string
    trend: number[]; teamId: string; latency: number; uptime: number; criticality: string
  }>
  activeIncidentList: Array<{
    id: string; title: string; severity: string; duration: string; appName: string; assignee: string
  }>
  environmentHealth: Array<{
    name: string; score: number; status: string; appCount: number; incidentCount: number
  }>
  connectorHealth: Array<{
    name: string; status: string; healthPct: number; category: string; lastSync: string
  }>
  aiHighlights: Array<{
    id: string; title: string; type: string; priority: string; appName: string; confidence: number
  }>
  heatmapData: Array<{ region: string; production: number; staging: number; development: number }>
}

export function mapDashboardOverview(d: DashboardOverview): DashboardOverviewModel {
  return {
    totalApps: safeNumber(d.total_apps),
    healthyApps: safeNumber(d.healthy_apps),
    degradedApps: safeNumber(d.degraded_apps),
    criticalApps: safeNumber(d.critical_apps),
    avgHealthScore: safeNumber(d.avg_health_score),
    activeIncidents: safeNumber(d.active_incidents),
    activeAlerts: safeNumber(d.active_alerts),
    overallUptime: safeNumber(d.overall_uptime, 99.9),
    avgLatency: safeNumber(d.avg_latency),
    health24h: safeArray(d.health_24h).map(h => ({
      hour: safeString(h.hour),
      score: safeNumber(h.score),
      incidents: safeNumber(h.incidents),
    })),
    topImpacted: safeArray(d.top_impacted).map(a => ({
      id: safeString(a.id),
      name: safeString(a.name),
      score: safeNumber(a.score),
      status: normalizeHealthStatus(a.status),
      trend: safeArray(a.trend),
      teamId: safeString(a.team_id),
      latency: safeNumber(a.latency),
      uptime: safeNumber(a.uptime, 100),
      criticality: safeString(a.criticality, "P1"),
    })),
    activeIncidentList: safeArray(d.active_incident_list).map(i => ({
      id: safeString(i.id),
      title: safeString(i.title),
      severity: normalizeSeverity(i.severity),
      duration: safeString(i.duration, "—"),
      appName: safeString(i.app_name),
      assignee: safeString(i.assignee, "Unassigned"),
    })),
    environmentHealth: safeArray(d.environment_health).map(e => ({
      name: safeString(e.name),
      score: safeNumber(e.score),
      status: normalizeHealthStatus(e.status),
      appCount: safeNumber(e.app_count),
      incidentCount: safeNumber(e.incident_count),
    })),
    connectorHealth: safeArray(d.connector_health).map(c => ({
      name: safeString(c.name),
      status: normalizeConnectorStatus(c.status),
      healthPct: safeNumber(c.health_pct),
      category: safeString(c.category),
      lastSync: formatRelativeTime(c.last_sync) || safeString(c.last_sync, "—"),
    })),
    aiHighlights: safeArray(d.ai_highlights).map(h => ({
      id: safeString(h.id),
      title: safeString(h.title),
      type: safeString(h.type, "info"),
      priority: safeString(h.priority, "low"),
      appName: safeString(h.app_name),
      confidence: safeNumber(h.confidence),
    })),
    heatmapData: safeArray(d.heatmap_data).map(r => ({
      region: safeString(r.region),
      production: safeNumber(r.production, 100),
      staging: safeNumber(r.staging, 100),
      development: safeNumber(r.development, 100),
    })),
  }
}
