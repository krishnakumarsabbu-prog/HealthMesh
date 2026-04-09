import type { Incident as ApiIncident, Alert as ApiAlert } from "@/lib/api/incidents"
import type { IncidentModel, AlertModel } from "@/lib/types/incident"
import { normalizeSeverity, normalizeIncidentStatus } from "@/lib/types/enums"
import { safeArray, safeNumber, safeString, formatRelativeTime } from "@/lib/mappers/utils"

export function mapIncident(i: ApiIncident): IncidentModel {
  return {
    id: safeString(i.id),
    title: safeString(i.title),
    appId: safeString(i.app_id),
    appName: safeString(i.app_name),
    apps: i.app_name ? [i.app_name] : [],
    sources: [],
    severity: normalizeSeverity(i.severity),
    status: normalizeIncidentStatus(i.status),
    age: safeString(i.duration) || formatRelativeTime(i.started_at) || "—",
    owner: "",
    assignee: safeString(i.assignee, "Unassigned"),
    description: safeString(i.ai_cause, "Investigation in progress."),
    aiCause: safeString(i.ai_cause, "Under investigation"),
    healthImpact: typeof i.health_impact === "string"
      ? (parseInt(i.health_impact) || 0)
      : safeNumber(i.health_impact as number),
    affectedDeps: safeArray(i.affected_deps),
    timeline: safeArray(i.timeline).map(ev => ({
      time: safeString(ev.time),
      event: safeString(ev.event),
      type: (safeString(ev.type, "update")) as IncidentModel["timeline"][0]["type"],
    })),
    startedAt: safeString(i.started_at),
    resolvedAt: i.resolved_at || null,
  }
}

export function mapAlert(a: ApiAlert): AlertModel {
  return {
    id: safeString(a.id),
    appId: safeString(a.app_id),
    appName: safeString(a.app_name),
    ruleName: safeString(a.rule_name),
    metric: safeString(a.metric),
    value: typeof a.value === "string" ? parseFloat(a.value) || 0 : safeNumber(a.value as number),
    threshold: typeof a.threshold === "string" ? parseFloat(a.threshold) || 0 : safeNumber(a.threshold as number),
    severity: normalizeSeverity(a.severity),
    status: (safeString(a.status, "firing")) as AlertModel["status"],
    source: safeString(a.environment),
    environment: safeString(a.environment),
    firedAt: safeString(a.fired_at),
    acknowledgedAt: null,
  }
}
