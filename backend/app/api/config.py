from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth_deps import get_current_user
from app.models.identity import User

router = APIRouter(prefix="/api/config", tags=["config"])

CONNECTOR_TEMPLATES = [
    {"id": "datadog", "name": "Datadog", "category": "APM", "abbr": "DD", "icon_bg": "bg-violet-500/10 text-violet-500", "description": "APM, metrics, traces and logs", "display_order": 1},
    {"id": "prometheus", "name": "Prometheus", "category": "Infra", "abbr": "PR", "icon_bg": "bg-orange-500/10 text-orange-500", "description": "Open-source metrics and alerting", "display_order": 2},
    {"id": "cloudwatch", "name": "AWS CloudWatch", "category": "Cloud", "abbr": "CW", "icon_bg": "bg-amber-500/10 text-amber-500", "description": "AWS native observability", "display_order": 3},
    {"id": "splunk", "name": "Splunk", "category": "Logs", "abbr": "SP", "icon_bg": "bg-green-500/10 text-green-600", "description": "Log aggregation and search", "display_order": 4},
    {"id": "appdynamics", "name": "AppDynamics", "category": "APM", "abbr": "AD", "icon_bg": "bg-blue-500/10 text-blue-500", "description": "Business transaction monitoring", "display_order": 5},
    {"id": "grafana", "name": "Grafana", "category": "Infra", "abbr": "GF", "icon_bg": "bg-rose-500/10 text-rose-500", "description": "Dashboards and visualization", "display_order": 6},
    {"id": "dynatrace", "name": "Dynatrace", "category": "APM", "abbr": "DT", "icon_bg": "bg-teal-500/10 text-teal-500", "description": "AI-powered full-stack APM", "display_order": 7},
    {"id": "pagerduty", "name": "PagerDuty", "category": "Incident", "abbr": "PD", "icon_bg": "bg-emerald-500/10 text-emerald-500", "description": "Incident response platform", "display_order": 8},
    {"id": "kafka", "name": "Kafka / MQ", "category": "Messaging", "abbr": "KF", "icon_bg": "bg-slate-500/10 text-slate-500", "description": "Message queue monitoring", "display_order": 9},
    {"id": "database", "name": "Database Monitor", "category": "Database", "abbr": "DB", "icon_bg": "bg-cyan-500/10 text-cyan-500", "description": "SQL/NoSQL query insights", "display_order": 10},
    {"id": "synthetic", "name": "Synthetic Health", "category": "Synthetic", "abbr": "SY", "icon_bg": "bg-pink-500/10 text-pink-500", "description": "Proactive synthetic probing", "display_order": 11},
    {"id": "custom", "name": "Custom REST API", "category": "Custom", "abbr": "CR", "icon_bg": "bg-slate-500/10 text-slate-400", "description": "Any HTTP/REST endpoint", "display_order": 12},
]

ENVIRONMENTS = [
    {"id": "1", "name": "Production", "color_class": "bg-emerald-500", "display_order": 1},
    {"id": "2", "name": "Staging", "color_class": "bg-amber-500", "display_order": 2},
    {"id": "3", "name": "Development", "color_class": "bg-blue-500", "display_order": 3},
    {"id": "4", "name": "QA", "color_class": "bg-blue-500", "display_order": 4},
]

AVAILABLE_METRICS = [
    {"id": "latency_p99", "label": "P99 Latency", "connector_name": "Datadog", "metric_type": "APM", "recommended": True, "display_order": 1},
    {"id": "latency_p95", "label": "P95 Latency", "connector_name": "Datadog", "metric_type": "APM", "recommended": True, "display_order": 2},
    {"id": "error_rate", "label": "Error Rate", "connector_name": "Datadog", "metric_type": "APM", "recommended": True, "display_order": 3},
    {"id": "throughput", "label": "Throughput (RPM)", "connector_name": "Datadog", "metric_type": "APM", "recommended": True, "display_order": 4},
    {"id": "availability", "label": "Availability %", "connector_name": "Synthetic", "metric_type": "Synthetic", "recommended": True, "display_order": 5},
    {"id": "cpu_pct", "label": "CPU Utilization %", "connector_name": "Prometheus", "metric_type": "Infra", "recommended": False, "display_order": 6},
    {"id": "memory_pct", "label": "Memory Utilization %", "connector_name": "Prometheus", "metric_type": "Infra", "recommended": False, "display_order": 7},
    {"id": "pod_restarts", "label": "Pod Restarts", "connector_name": "Prometheus", "metric_type": "Infra", "recommended": False, "display_order": 8},
    {"id": "db_conn_pool", "label": "DB Connection Pool", "connector_name": "CloudWatch", "metric_type": "Database", "recommended": False, "display_order": 9},
    {"id": "incidents_open", "label": "Open Incidents", "connector_name": "PagerDuty", "metric_type": "Incident", "recommended": True, "display_order": 10},
    {"id": "slo_budget", "label": "Error Budget Remaining", "connector_name": "Datadog", "metric_type": "SLO", "recommended": True, "display_order": 11},
]

HEALTH_SCORE_WEIGHTS = [
    {"id": "1", "label": "Latency", "weight": 30, "color": "#10b981", "display_order": 1},
    {"id": "2", "label": "Errors", "weight": 25, "color": "#3b82f6", "display_order": 2},
    {"id": "3", "label": "Availability", "weight": 25, "color": "#f59e0b", "display_order": 3},
    {"id": "4", "label": "Infrastructure", "weight": 10, "color": "#8b5cf6", "display_order": 4},
    {"id": "5", "label": "Incidents", "weight": 10, "color": "#ef4444", "display_order": 5},
]

NOTIFICATIONS = [
    {"id": "n1", "type": "critical", "title": "payments-api latency spike", "description": "P99 > 2000ms for 5 minutes", "is_read": False, "created_at": "2026-04-12T10:00:00Z"},
    {"id": "n2", "type": "warning", "title": "auth-service memory warning", "description": "Memory at 87% capacity", "is_read": False, "created_at": "2026-04-12T09:45:00Z"},
    {"id": "n3", "type": "healthy", "title": "database-primary recovered", "description": "Incident resolved automatically", "is_read": False, "created_at": "2026-04-12T09:30:00Z"},
    {"id": "n4", "type": "info", "title": "Scheduled maintenance", "description": "Tonight 2-4am UTC", "is_read": False, "created_at": "2026-04-12T09:00:00Z"},
]

_notifications_state = [dict(n) for n in NOTIFICATIONS]


@router.get("/connector-templates")
def list_connector_templates(
    current_user: User = Depends(get_current_user),
):
    return CONNECTOR_TEMPLATES


@router.get("/environments")
def list_environments(
    current_user: User = Depends(get_current_user),
):
    return ENVIRONMENTS


@router.get("/metrics")
def list_metrics(
    current_user: User = Depends(get_current_user),
):
    return AVAILABLE_METRICS


@router.get("/health-weights")
def list_health_weights(
    current_user: User = Depends(get_current_user),
):
    return HEALTH_SCORE_WEIGHTS


@router.get("/notifications")
def list_notifications(
    current_user: User = Depends(get_current_user),
):
    return _notifications_state


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
):
    for n in _notifications_state:
        if n["id"] == notification_id:
            n["is_read"] = True
            return {"ok": True}
    raise HTTPException(status_code=404, detail="Notification not found")
