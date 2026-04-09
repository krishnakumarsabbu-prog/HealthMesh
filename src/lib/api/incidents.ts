import { api } from "./client";

export interface Incident {
  id: string;
  app_id: string | null;
  app_name: string;
  title: string;
  severity: string;
  status: string;
  duration: string;
  assignee: string;
  ai_cause: string;
  health_impact: string;
  affected_deps: string[];
  timeline: Array<{ time: string; event: string; type: string }>;
  started_at: string;
  resolved_at: string;
}

export interface Alert {
  id: string;
  app_id: string | null;
  app_name: string;
  rule_name: string;
  metric: string;
  value: string;
  threshold: string;
  severity: string;
  status: string;
  fired_at: string;
  environment: string;
}

export const listIncidents = () => api.get<Incident[]>("/api/incidents");
export const listIncidentsByStatus = (status: string) => api.get<Incident[]>(`/api/incidents?status=${status}`);
export const getIncident = (id: string) => api.get<Incident>(`/api/incidents/${id}`);
export const updateIncident = (id: string, body: Partial<Incident>) => api.put<Incident>(`/api/incidents/${id}`, body);
export const acknowledgeIncident = (id: string) => api.put<Incident>(`/api/incidents/${id}`, { status: "acknowledged" });
export const resolveIncident = (id: string) => api.put<Incident>(`/api/incidents/${id}`, { status: "resolved" });
export const listAlerts = () => api.get<Alert[]>("/api/alerts");
export const listAlertsByStatus = (status: string) => api.get<Alert[]>(`/api/alerts?status=${status}`);
export const acknowledgeAlert = (id: string) => api.put<Alert>(`/api/alerts/${id}`, { status: "acknowledged" });
