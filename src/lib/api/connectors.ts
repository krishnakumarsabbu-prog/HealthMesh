import { api } from "./client";

export interface ConnectorTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string;
  color: string;
  version: string;
  fields: Array<{ key: string; label: string; type: string; required?: boolean; options?: string[] }>;
  capabilities: string[];
  popular: boolean;
}

export interface ConnectorInstance {
  id: string;
  template_id: string;
  name: string;
  category: string;
  environment: string;
  status: string;
  health_pct: number;
  app_count: number;
  version: string;
  last_sync: string;
  metrics_count: string;
  config: Record<string, unknown>;
}

export const listConnectorTemplates = () => api.get<ConnectorTemplate[]>("/api/connectors/templates");
export const listConnectorInstances = () => api.get<ConnectorInstance[]>("/api/connectors/instances");
export const createConnectorInstance = (data: Record<string, unknown>) =>
  api.post<{ id: string; name: string }>("/api/connectors/instances", data);
export const deleteConnectorInstance = (id: string) =>
  api.delete<{ deleted: boolean }>(`/api/connectors/instances/${id}`);
export const testConnector = (data: Record<string, unknown>) =>
  api.post<{ success: boolean; message: string; latency_ms: number }>("/api/connectors/test", data);
