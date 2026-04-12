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
  return api.get<ConnectorInstanceRow[]>("/api/connectors/instances")
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
  return api.post<ConnectorInstanceRow>("/api/connectors/instances", payload)
}

export async function deleteConnectorInstance(id: string): Promise<void> {
  await api.delete(`/api/connectors/instances/${id}`)
}

export async function updateConnectorInstance(
  id: string,
  payload: Partial<ConnectorInstanceRow>
): Promise<ConnectorInstanceRow> {
  return api.put<ConnectorInstanceRow>(`/api/connectors/instances/${id}`, payload)
}

export async function testConnectorConnection(payload: {
  template_id: string
  auth_fields: Record<string, string>
  environment?: string
}): Promise<ConnectorTestResult> {
  try {
    return await api.post<ConnectorTestResult>("/api/connectors/test", payload)
  } catch {
    return { success: false, message: "Could not reach the connector endpoint. Check your credentials and network." }
  }
}
