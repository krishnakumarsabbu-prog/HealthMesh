import { supabase } from "@/lib/supabase"

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
