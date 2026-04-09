import { api } from "./client";

export interface AppSummary {
  id: string;
  name: string;
  description: string;
  team_id: string;
  environment: string;
  status: string;
  criticality: string;
  health_score: number;
  uptime: number;
  latency_p99: number;
  rpm: number;
  app_type: string;
  runtime: string;
  version: string;
  platform: string;
  tags: string[];
  incident_count: number;
  dependency_count: number;
  connector_count: number;
  trend: number[];
  owner_name: string;
}

export interface AppSignal {
  id: number;
  app_id: string;
  category: string;
  name: string;
  value: string;
  unit: string;
  status: string;
  trend: string;
  delta: string;
  source: string;
}

export interface AppTransaction {
  id: number;
  app_id: string;
  endpoint: string;
  rpm: number;
  latency_p99: number;
  error_rate: number;
  apdex: number;
  status: string;
}

export interface AppLogPattern {
  id: number;
  app_id: string;
  level: string;
  message: string;
  count: number;
  first_seen: string;
  last_seen: string;
}

export interface AppInfraPod {
  id: number;
  app_id: string;
  pod_name: string;
  node: string;
  cpu_pct: number;
  mem_pct: number;
  restarts: number;
  age: string;
  status: string;
}

export interface AppDependency {
  id: number;
  app_id: string;
  dep_name: string;
  dep_type: string;
  status: string;
  latency: string;
  error_rate: string;
}

export interface AppEndpoint {
  id: number;
  app_id: string;
  method: string;
  path: string;
  status: string;
  rpm: number;
  latency_p99: number;
  error_rate: number;
  version: string;
  auth: string;
}

export interface AppIncident {
  id: string;
  app_id: string;
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

export interface AppHealthRule {
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
  weight?: number;
}

export interface AppAiInsight {
  id: string;
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

export interface AppOverview {
  app: AppSummary;
  health_history: Array<{ label: string; score: number }>;
  latency_24h: Array<{ t: string; p50: number; p95: number; p99: number }>;
  throughput_24h: Array<{ t: string; rpm: number }>;
  error_rate_24h: Array<{ t: string; rate: number }>;
}

export const listApps = () => api.get<AppSummary[]>("/api/apps");
export const getApp = (id: string) => api.get<AppSummary>(`/api/apps/${id}`);
export const getAppOverview = (id: string) => api.get<AppOverview>(`/api/apps/${id}/overview`);
export const getAppSignals = (id: string) => api.get<AppSignal[]>(`/api/apps/${id}/signals`);
export const getAppTransactions = (id: string) => api.get<AppTransaction[]>(`/api/apps/${id}/transactions`);
export const getAppLogs = (id: string) => api.get<AppLogPattern[]>(`/api/apps/${id}/logs`);
export const getAppInfra = (id: string) => api.get<AppInfraPod[]>(`/api/apps/${id}/infra`);
export const getAppEndpoints = (id: string) => api.get<AppEndpoint[]>(`/api/apps/${id}/apis`);
export const getAppDependencies = (id: string) => api.get<AppDependency[]>(`/api/apps/${id}/dependencies`);
export const getAppIncidents = (id: string) => api.get<AppIncident[]>(`/api/apps/${id}/incidents`);
export const getAppRules = (id: string) => api.get<AppHealthRule[]>(`/api/apps/${id}/rules`);
export const getAppAiSummary = (id: string) => api.get<AppAiInsight[]>(`/api/apps/${id}/ai-summary`);
export interface AppConfiguration {
  app_id: string;
  name: string;
  runtime: string;
  version: string;
  platform: string;
  environment: string;
  criticality: string;
  tags: string[];
  owner_name: string;
  connectors: Array<{ id: string; name: string; category: string; status: string }>;
  health_weights: { latency: number; errors: number; availability: number; infra: number; incidents: number };
  thresholds: { latency_warn: number; latency_crit: number; error_rate_warn: number; error_rate_crit: number };
}

export const getAppConfiguration = (id: string) => api.get<AppConfiguration>(`/api/apps/${id}/configuration`);
export const getAppHealthHistory = (id: string) => api.get<Array<{ label: string; score: number }>>(`/api/apps/${id}/health-history`);
export const createApp = (body: Partial<AppSummary>) => api.post<AppSummary>("/api/apps", body);
