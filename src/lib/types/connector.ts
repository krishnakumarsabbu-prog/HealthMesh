import type { ConnectorStatus, ConnectorCategory, Environment } from "./enums"

export interface ConnectorTemplateModel {
  id: string
  name: string
  category: ConnectorCategory
  description: string
  version: string
  fields: Array<{ key: string; label: string; type: string; required: boolean; placeholder?: string }>
  capabilities: string[]
  popular: boolean
  abbr: string
  iconBg: string
}

export interface ConnectorSyncEvent {
  time: string
  status: "success" | "warning" | "error"
  message: string
  metrics: number
}

export interface ConnectorConnectedApp {
  id: string
  name: string
  environment: Environment
  status: ConnectorStatus
}

export interface ConnectorInstanceModel {
  id: string
  templateId: string
  name: string
  category: ConnectorCategory
  status: ConnectorStatus
  environment: Environment
  version: string
  lastSync: string
  healthScore: number
  usageCount: number
  appsConnected: number
  capabilities: string[]
  description: string
  abbr: string
  iconBg: string
  bgColor: string
  config: Record<string, string>
  syncHistory: ConnectorSyncEvent[]
  connectedApps: ConnectorConnectedApp[]
}

export interface ConnectorTestResult {
  success: boolean
  message: string
  latencyMs: number
  metricsFound: number
}
