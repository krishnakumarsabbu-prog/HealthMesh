import type { Severity } from "./enums"

export interface HealthRuleModel {
  id: string
  name: string
  metric: string
  operator: string
  threshold: number
  thresholdDisplay: string
  severity: Severity
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
  linkedApps: string[]
}

export interface HealthRuleCreateModel {
  name: string
  metric: string
  operator: string
  threshold: number
  severity: Severity
  scope: string
  description: string
  weight: number
  tags: string[]
}
