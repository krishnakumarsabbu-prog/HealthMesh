import type { Severity, IncidentStatus, AlertStatus } from "./enums"

export interface IncidentTimelineEvent {
  time: string
  event: string
  type: "detection" | "threshold" | "correlation" | "assignment" | "alert" | "ack" | "update" | "action" | "resolution"
}

export interface IncidentModel {
  id: string
  title: string
  appId: string
  appName: string
  apps: string[]
  sources: string[]
  severity: Severity
  status: IncidentStatus
  age: string
  owner: string
  assignee: string
  description: string
  aiCause: string
  healthImpact: number
  affectedDeps: string[]
  timeline: IncidentTimelineEvent[]
  startedAt: string
  resolvedAt: string | null
}

export interface AlertModel {
  id: string
  appId: string
  appName: string
  ruleName: string
  metric: string
  value: number
  threshold: number
  severity: Severity
  status: AlertStatus
  source: string
  environment: string
  firedAt: string
  acknowledgedAt: string | null
}
