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
export const getIncident = (id: string) => api.get<Incident>(`/api/incidents/${id}`);
export const listAlerts = () => api.get<Alert[]>("/api/alerts");
