import { api } from "./client";

export interface DashboardOverview {
  total_apps: number;
  healthy_apps: number;
  degraded_apps: number;
  critical_apps: number;
  avg_health_score: number;
  active_incidents: number;
  active_alerts: number;
  overall_uptime: number;
  avg_latency: number;
  health_24h: Array<{ hour: string; score: number; incidents: number }>;
  top_impacted: Array<{
    id: string;
    name: string;
    score: number;
    status: string;
    trend: number[];
    team_id: string;
    latency: number;
    uptime: number;
    criticality: string;
  }>;
  active_incident_list: Array<{
    id: string;
    title: string;
    severity: string;
    duration: string;
    app_name: string;
    assignee: string;
  }>;
  environment_health: Array<{
    name: string;
    score: number;
    status: string;
    app_count: number;
    incident_count: number;
  }>;
  connector_health: Array<{
    name: string;
    status: string;
    health_pct: number;
    category: string;
    last_sync: string;
  }>;
  ai_highlights: Array<{
    id: string;
    title: string;
    type: string;
    priority: string;
    app_name: string;
    confidence: number;
  }>;
  heatmap_data: Array<{
    region: string;
    production: number;
    staging: number;
    development: number;
  }>;
}

export const getDashboardOverview = () =>
  api.get<DashboardOverview>("/api/dashboard/overview");

export const getDashboardTrends = () =>
  api.get<Array<{ hour: string; score: number; incidents: number; alerts: number }>>("/api/dashboard/trends");
