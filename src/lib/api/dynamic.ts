import { api } from "./client"

export interface ConnectorTemplate {
  id: string
  name: string
  category: string
  abbr: string
  icon_bg: string
  description: string
  display_order: number
}

export interface Environment {
  id: string
  name: string
  color_class: string
  display_order: number
}

export interface AvailableMetric {
  id: string
  label: string
  connector_name: string
  metric_type: string
  recommended: boolean
  display_order: number
}

export interface HealthScoreWeight {
  id: string
  label: string
  weight: number
  color: string
  display_order: number
}

export interface Notification {
  id: string
  type: string
  title: string
  description: string
  is_read: boolean
  user_id?: string | null
  created_at: string
}

export function listConnectorTemplates(): Promise<ConnectorTemplate[]> {
  return api.get<ConnectorTemplate[]>("/api/config/connector-templates")
}

export function listEnvironments(): Promise<Environment[]> {
  return api.get<Environment[]>("/api/config/environments")
}

export function listAvailableMetrics(): Promise<AvailableMetric[]> {
  return api.get<AvailableMetric[]>("/api/config/metrics")
}

export function listHealthScoreWeights(): Promise<HealthScoreWeight[]> {
  return api.get<HealthScoreWeight[]>("/api/config/health-weights")
}

export function listNotifications(): Promise<Notification[]> {
  return api.get<Notification[]>("/api/config/notifications")
}

export function markNotificationRead(id: string): Promise<void> {
  return api.put<void>(`/api/config/notifications/${id}/read`, {})
}
