import { supabase } from "@/lib/supabase"

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
  user_id: string | null
  created_at: string
}

export async function listConnectorTemplates(): Promise<ConnectorTemplate[]> {
  const { data, error } = await supabase
    .from("connector_templates")
    .select("*")
    .order("display_order", { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function listEnvironments(): Promise<Environment[]> {
  const { data, error } = await supabase
    .from("environments")
    .select("*")
    .order("display_order", { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function listAvailableMetrics(): Promise<AvailableMetric[]> {
  const { data, error } = await supabase
    .from("available_metrics")
    .select("*")
    .order("display_order", { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function listHealthScoreWeights(): Promise<HealthScoreWeight[]> {
  const { data, error } = await supabase
    .from("health_score_weights")
    .select("*")
    .order("display_order", { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function listNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
  if (error) throw new Error(error.message)
}
