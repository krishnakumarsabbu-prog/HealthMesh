import { supabase } from "@/lib/supabase"
import { api } from "@/lib/api/client"

export interface ConnectorTestResult {
  success: boolean
  message: string
  latency_ms?: number
  details?: Record<string, string>
}

export interface ConnectorInstanceRow {
  id: string
  name: string
  template_id: string
  category: string
  status: string
  environment: string
  lob_id: string | null
  managed_by: string | null
  version: string
  health_score: number
  apps_connected: number
  capabilities: string[]
  description: string
  abbr: string
  icon_bg: string
  bg_color: string
  last_sync: string
  usage_count: number
  created_by: string | null
  created_at: string
}

export async function listConnectorInstances(): Promise<ConnectorInstanceRow[]> {
  const { data, error } = await supabase
    .from("connector_instances")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as ConnectorInstanceRow[]
}

export async function createConnectorInstance(payload: {
  name: string
  template_id: string
  category: string
  status?: string
  environment?: string
  lob_id?: string | null
  managed_by?: string | null
  version?: string
  health_score?: number
  capabilities?: string[]
  description?: string
  abbr?: string
  icon_bg?: string
  bg_color?: string
}): Promise<ConnectorInstanceRow> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("connector_instances")
    .insert({ ...payload, created_by: user?.id ?? null })
    .select()
    .single()
  if (error) throw error
  return data as ConnectorInstanceRow
}

export async function deleteConnectorInstance(id: string): Promise<void> {
  const { error } = await supabase
    .from("connector_instances")
    .delete()
    .eq("id", id)
  if (error) throw error
}

export async function updateConnectorInstance(
  id: string,
  payload: Partial<ConnectorInstanceRow>
): Promise<ConnectorInstanceRow> {
  const { data, error } = await supabase
    .from("connector_instances")
    .update(payload)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as ConnectorInstanceRow
}

export async function testConnectorConnection(payload: {
  template_id: string
  auth_fields: Record<string, string>
  environment?: string
}): Promise<ConnectorTestResult> {
  try {
    const result = await api.post<ConnectorTestResult>("/api/connectors/test", payload)
    return result
  } catch {
    return { success: false, message: "Could not reach the connector endpoint. Check your credentials and network." }
  }
}
