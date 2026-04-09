-- HealthMesh Master Schema
-- SQLite Database Schema for HealthMesh Enterprise Health Intelligence Platform

CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tier INTEGER DEFAULT 2,
    health_score REAL DEFAULT 100.0,
    incident_count INTEGER DEFAULT 0,
    lead_name TEXT DEFAULT '',
    slack_channel TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL REFERENCES teams(id),
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    role TEXT DEFAULT '',
    email TEXT DEFAULT '',
    on_call INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS environments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    health_score REAL DEFAULT 100.0,
    app_count INTEGER DEFAULT 0,
    incident_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'healthy',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    team_id TEXT NOT NULL REFERENCES teams(id),
    environment TEXT DEFAULT 'Production',
    status TEXT DEFAULT 'healthy',
    criticality TEXT DEFAULT 'P1',
    health_score REAL DEFAULT 100.0,
    uptime REAL DEFAULT 99.9,
    latency_p99 REAL DEFAULT 100.0,
    rpm REAL DEFAULT 1000.0,
    app_type TEXT DEFAULT 'Service',
    runtime TEXT DEFAULT '',
    version TEXT DEFAULT '',
    platform TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    incident_count INTEGER DEFAULT 0,
    dependency_count INTEGER DEFAULT 0,
    connector_count INTEGER DEFAULT 0,
    trend TEXT DEFAULT '[]',
    owner_name TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_health_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL REFERENCES applications(id),
    score REAL NOT NULL,
    label TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL REFERENCES applications(id),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT DEFAULT '',
    status TEXT DEFAULT 'healthy',
    trend TEXT DEFAULT 'stable',
    delta TEXT DEFAULT '',
    source TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL REFERENCES applications(id),
    endpoint TEXT NOT NULL,
    rpm REAL DEFAULT 0,
    latency_p99 REAL DEFAULT 0,
    error_rate REAL DEFAULT 0,
    apdex REAL DEFAULT 1.0,
    status TEXT DEFAULT 'healthy',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_log_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL REFERENCES applications(id),
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    first_seen TEXT DEFAULT '',
    last_seen TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_infra_pods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL REFERENCES applications(id),
    pod_name TEXT NOT NULL,
    node TEXT DEFAULT '',
    cpu_pct REAL DEFAULT 0,
    mem_pct REAL DEFAULT 0,
    restarts INTEGER DEFAULT 0,
    age TEXT DEFAULT '',
    status TEXT DEFAULT 'Running',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL REFERENCES applications(id),
    dep_name TEXT NOT NULL,
    dep_type TEXT DEFAULT 'Service',
    status TEXT DEFAULT 'healthy',
    latency TEXT DEFAULT '',
    error_rate TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_endpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL REFERENCES applications(id),
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status TEXT DEFAULT 'healthy',
    rpm REAL DEFAULT 0,
    latency_p99 REAL DEFAULT 0,
    error_rate REAL DEFAULT 0,
    version TEXT DEFAULT 'v1',
    auth TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS connector_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT DEFAULT '',
    logo TEXT DEFAULT '',
    color TEXT DEFAULT '',
    version TEXT DEFAULT '',
    fields TEXT DEFAULT '[]',
    capabilities TEXT DEFAULT '[]',
    popular INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS connector_instances (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL REFERENCES connector_templates(id),
    name TEXT NOT NULL,
    category TEXT DEFAULT '',
    environment TEXT DEFAULT 'Production',
    status TEXT DEFAULT 'healthy',
    health_pct REAL DEFAULT 100.0,
    app_count INTEGER DEFAULT 0,
    version TEXT DEFAULT '',
    last_sync TEXT DEFAULT '',
    metrics_count TEXT DEFAULT '0',
    config TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    metric TEXT NOT NULL,
    operator TEXT NOT NULL,
    threshold REAL NOT NULL,
    severity TEXT DEFAULT 'warning',
    enabled INTEGER DEFAULT 1,
    scope TEXT DEFAULT 'all',
    trigger_count INTEGER DEFAULT 0,
    tags TEXT DEFAULT '[]',
    version INTEGER DEFAULT 1,
    last_triggered TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_health_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL REFERENCES applications(id),
    rule_id TEXT NOT NULL REFERENCES health_rules(id),
    enabled INTEGER DEFAULT 1,
    custom_threshold REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    app_id TEXT REFERENCES applications(id),
    app_name TEXT DEFAULT '',
    title TEXT NOT NULL,
    severity TEXT DEFAULT 'warning',
    status TEXT DEFAULT 'active',
    duration TEXT DEFAULT '',
    assignee TEXT DEFAULT '',
    ai_cause TEXT DEFAULT '',
    health_impact TEXT DEFAULT '',
    affected_deps TEXT DEFAULT '[]',
    timeline TEXT DEFAULT '[]',
    started_at TEXT DEFAULT '',
    resolved_at TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    app_id TEXT REFERENCES applications(id),
    app_name TEXT DEFAULT '',
    rule_name TEXT NOT NULL,
    metric TEXT NOT NULL,
    value TEXT NOT NULL,
    threshold TEXT NOT NULL,
    severity TEXT DEFAULT 'warning',
    status TEXT DEFAULT 'firing',
    fired_at TEXT DEFAULT '',
    environment TEXT DEFAULT 'Production',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dependency_nodes (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    node_type TEXT DEFAULT 'service',
    status TEXT DEFAULT 'healthy',
    latency TEXT DEFAULT '',
    error_rate TEXT DEFAULT '',
    rps TEXT DEFAULT '',
    uptime TEXT DEFAULT '',
    version TEXT DEFAULT '',
    team TEXT DEFAULT '',
    x REAL DEFAULT 0,
    y REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dependency_edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL REFERENCES dependency_nodes(id),
    target_id TEXT NOT NULL REFERENCES dependency_nodes(id),
    status TEXT DEFAULT 'healthy',
    latency TEXT DEFAULT '',
    label TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_insights (
    id TEXT PRIMARY KEY,
    app_id TEXT REFERENCES applications(id),
    app_name TEXT DEFAULT '',
    insight_type TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence REAL DEFAULT 0.8,
    impact TEXT DEFAULT '',
    recommendation TEXT DEFAULT '',
    signals TEXT DEFAULT '[]',
    what_changed TEXT DEFAULT '',
    generated_at TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboard_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hour_label TEXT DEFAULT '',
    health_score REAL DEFAULT 100.0,
    incidents INTEGER DEFAULT 0,
    alerts INTEGER DEFAULT 0,
    healthy_apps INTEGER DEFAULT 0,
    degraded_apps INTEGER DEFAULT 0,
    critical_apps INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trend_data_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_type TEXT DEFAULT 'daily',
    label TEXT NOT NULL,
    health_score REAL DEFAULT 100.0,
    availability REAL DEFAULT 99.9,
    incidents INTEGER DEFAULT 0,
    latency REAL DEFAULT 100.0,
    error_rate REAL DEFAULT 0.0,
    mttr REAL DEFAULT 0.0,
    mttd REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_windows (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    affected_apps TEXT DEFAULT '[]',
    status TEXT DEFAULT 'scheduled',
    created_by TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sla_settings (
    id TEXT PRIMARY KEY,
    app_id TEXT DEFAULT '',
    name TEXT NOT NULL,
    target_pct REAL DEFAULT 99.9,
    current_pct REAL DEFAULT 99.9,
    error_budget_remaining REAL DEFAULT 100.0,
    period TEXT DEFAULT '30d',
    status TEXT DEFAULT 'healthy',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT DEFAULT 'System',
    user_email TEXT DEFAULT '',
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT DEFAULT '',
    resource_name TEXT DEFAULT '',
    details TEXT DEFAULT '',
    ip_address TEXT DEFAULT '',
    timestamp TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    description TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_applications_team ON applications(team_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_app_signals_app_id ON app_signals(app_id);
CREATE INDEX IF NOT EXISTS idx_app_transactions_app_id ON app_transactions(app_id);
CREATE INDEX IF NOT EXISTS idx_incidents_app_id ON incidents(app_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_app_id ON ai_insights(app_id);
CREATE INDEX IF NOT EXISTS idx_trend_data_period ON trend_data_points(period_type);
