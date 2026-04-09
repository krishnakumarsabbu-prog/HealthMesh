from pydantic import BaseModel
from typing import Any, Optional


class HealthRuleOut(BaseModel):
    id: str
    name: str
    metric: str
    operator: str
    threshold: float
    severity: str
    enabled: bool
    scope: str
    trigger_count: int
    tags: list
    version: int
    last_triggered: str
    description: str

    class Config:
        from_attributes = True


class HealthRuleCreate(BaseModel):
    id: str
    name: str
    metric: str
    operator: str
    threshold: float
    severity: str = "warning"
    enabled: bool = True
    scope: str = "all"
    tags: list = []
    description: str = ""


class ConnectorTemplateOut(BaseModel):
    id: str
    name: str
    category: str
    description: str
    logo: str
    color: str
    version: str
    fields: list
    capabilities: list
    popular: bool

    class Config:
        from_attributes = True


class ConnectorInstanceOut(BaseModel):
    id: str
    template_id: str
    name: str
    category: str
    environment: str
    status: str
    health_pct: float
    app_count: int
    version: str
    last_sync: str
    metrics_count: str
    config: dict

    class Config:
        from_attributes = True


class ConnectorInstanceCreate(BaseModel):
    id: str
    template_id: str
    name: str
    category: str
    environment: str = "Production"
    config: dict = {}


class IncidentOut(BaseModel):
    id: str
    app_id: Optional[str]
    app_name: str
    title: str
    severity: str
    status: str
    duration: str
    assignee: str
    ai_cause: str
    health_impact: str
    affected_deps: list
    timeline: list
    started_at: str
    resolved_at: str

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: str
    app_id: Optional[str]
    app_name: str
    rule_name: str
    metric: str
    value: str
    threshold: str
    severity: str
    status: str
    fired_at: str
    environment: str

    class Config:
        from_attributes = True


class DependencyNodeOut(BaseModel):
    id: str
    label: str
    node_type: str
    status: str
    latency: str
    error_rate: str
    rps: str
    uptime: str
    version: str
    team: str
    x: float
    y: float

    class Config:
        from_attributes = True


class DependencyEdgeOut(BaseModel):
    id: int
    source_id: str
    target_id: str
    status: str
    latency: str
    label: str

    class Config:
        from_attributes = True


class AiInsightOut(BaseModel):
    id: str
    app_id: Optional[str]
    app_name: str
    insight_type: str
    priority: str
    title: str
    description: str
    confidence: float
    impact: str
    recommendation: str
    signals: list
    what_changed: str
    generated_at: str

    class Config:
        from_attributes = True


class TrendDataPointOut(BaseModel):
    label: str
    health_score: float
    availability: float
    incidents: int
    latency: float
    error_rate: float
    mttr: float
    mttd: float

    class Config:
        from_attributes = True


class DashboardOverview(BaseModel):
    total_apps: int
    healthy_apps: int
    degraded_apps: int
    critical_apps: int
    avg_health_score: float
    active_incidents: int
    active_alerts: int
    overall_uptime: float
    avg_latency: float
    health_24h: list[dict]
    top_impacted: list[dict]
    active_incident_list: list[dict]
    environment_health: list[dict]
    connector_health: list[dict]
    ai_highlights: list[dict]
    heatmap_data: list[dict]


class MaintenanceWindowOut(BaseModel):
    id: str
    title: str
    description: str
    start_time: str
    end_time: str
    affected_apps: list
    status: str
    created_by: str

    class Config:
        from_attributes = True


class SLASettingOut(BaseModel):
    id: str
    app_id: str
    name: str
    target_pct: float
    current_pct: float
    error_budget_remaining: float
    period: str
    status: str

    class Config:
        from_attributes = True


class AuditLogOut(BaseModel):
    id: int
    user_name: str
    user_email: str
    action: str
    resource_type: str
    resource_id: str
    resource_name: str
    details: str
    ip_address: str
    timestamp: str

    class Config:
        from_attributes = True
