import { api } from "./client";

export interface HealthRule {
  id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  severity: string;
  enabled: boolean;
  scope: string;
  trigger_count: number;
  tags: string[];
  version: number;
  last_triggered: string;
  description: string;
}

export interface DependencyNode {
  id: string;
  label: string;
  node_type: string;
  status: string;
  latency: string;
  error_rate: string;
  rps: string;
  uptime: string;
  version: string;
  team: string;
  x: number;
  y: number;
}

export interface DependencyEdge {
  id: number;
  source_id: string;
  target_id: string;
  status: string;
  latency: string;
  label: string;
}

export interface DependencyMap {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  stats: {
    total_services: number;
    total_connections: number;
    degraded_paths: number;
    critical_nodes: number;
  };
}

export interface AiInsight {
  id: string;
  app_id: string | null;
  app_name: string;
  insight_type: string;
  priority: string;
  title: string;
  description: string;
  confidence: number;
  impact: string;
  recommendation: string;
  signals: string[];
  what_changed: string;
  generated_at: string;
}

export interface TrendDataPoint {
  label: string;
  health_score: number;
  availability: number;
  incidents: number;
  latency: number;
  error_rate: number;
  mttr: number;
  mttd: number;
}

export interface SourceTrend {
  name: string;
  score: number;
  trend: number;
  incidents: number;
  status: string;
}

export interface TeamTrend {
  name: string;
  score: number;
  trend: number;
  apps: number;
  incidents: number;
}

export interface EnvTrend {
  env: string;
  score: number;
  incidents: number;
  availability: number;
  latency: number;
}

export interface TrendSummary {
  avg_availability: string;
  total_incidents: number;
  mttr_improvement: string;
  avg_latency_delta: string;
  incident_reduction_pct: number;
  sources: SourceTrend[];
  teams: TeamTrend[];
  environments: EnvTrend[];
}

export interface Team {
  id: string;
  name: string;
  tier: number;
  health_score: number;
  incident_count: number;
  lead_name: string;
  slack_channel: string;
  description: string;
  app_names: string[];
  members: Array<{
    id: number;
    name: string;
    initials: string;
    role: string;
    email: string;
    on_call: boolean;
  }>;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  affected_apps: string[];
  status: string;
  created_by: string;
}

export interface SLASetting {
  id: string;
  app_id: string;
  name: string;
  target_pct: number;
  current_pct: number;
  error_budget_remaining: number;
  period: string;
  status: string;
}

export interface AuditLog {
  id: number;
  user_name: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  resource_name: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

export interface SystemStatusService {
  name: string;
  status: string;
  latency: string;
  uptime: string;
  category: string;
}

export interface SystemStatusResponse {
  status: string;
  database: string;
  counts: {
    applications: number;
    incidents: number;
    alerts: number;
    connectors: number;
  };
}

export const listHealthRules = () => api.get<HealthRule[]>("/api/rules");
export const createHealthRule = (body: Partial<HealthRule>) => api.post<HealthRule>("/api/rules", body);
export const updateHealthRule = (id: string, body: Partial<HealthRule>) => api.put<HealthRule>(`/api/rules/${id}`, body);
export const toggleHealthRule = (id: string, enabled: boolean) => api.put<HealthRule>(`/api/rules/${id}`, { enabled });
export const getDependencyMap = () => api.get<DependencyMap>("/api/dependencies/map");
export const listAiInsights = () => api.get<AiInsight[]>("/api/ai/insights");
export const getTrends = (period = "monthly") =>
  api.get<TrendDataPoint[]>(`/api/trends/health?period=${period}`);
export const getWeeklyTrends = () =>
  api.get<TrendDataPoint[]>("/api/trends/health?period=weekly");
export const getTrendSummary = () => api.get<TrendSummary>("/api/trends/summary");
export const listTeams = () => api.get<Team[]>("/api/teams");
export const listMaintenanceWindows = () => api.get<MaintenanceWindow[]>("/api/maintenance");
export const createMaintenanceWindow = (body: Record<string, unknown>) => api.post<MaintenanceWindow>("/api/maintenance", body);
export const listSLASettings = () => api.get<SLASetting[]>("/api/sla");
export const listAuditLogs = (limit = 100) => api.get<AuditLog[]>(`/api/audit?limit=${limit}`);
export const getSystemStatus = () => api.get<SystemStatusResponse>("/api/admin/system-status");
