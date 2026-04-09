from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models import Application, Incident, Alert, DashboardSnapshot, AiInsight, Environment, ConnectorInstance
from app.schemas.common import DashboardOverview

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/overview")
def get_overview(db: Session = Depends(get_db)):
    apps = db.query(Application).all()
    total = len(apps)
    healthy = sum(1 for a in apps if a.status == "healthy")
    degraded = sum(1 for a in apps if a.status == "warning")
    critical = sum(1 for a in apps if a.status == "critical")
    avg_score = round(sum(a.health_score for a in apps) / total, 1) if total else 0
    active_incidents = db.query(Incident).filter(Incident.status == "active").count()
    active_alerts = db.query(Alert).filter(Alert.status == "firing").count()
    avg_uptime = round(sum(a.uptime for a in apps) / total, 2) if total else 0
    avg_latency = round(sum(a.latency_p99 for a in apps) / total, 1) if total else 0

    snapshots = db.query(DashboardSnapshot).all()
    health_24h = [{"hour": s.hour_label, "score": s.health_score, "incidents": s.incidents} for s in snapshots]

    top_impacted = []
    critical_apps = sorted([a for a in apps if a.status in ("critical", "warning")], key=lambda x: x.health_score)
    for a in critical_apps[:6]:
        top_impacted.append({
            "id": a.id,
            "name": a.name,
            "score": a.health_score,
            "status": a.status,
            "trend": a.trend,
            "team_id": a.team_id,
            "latency": a.latency_p99,
            "uptime": a.uptime,
            "criticality": a.criticality,
        })

    incident_list = []
    active_incs = db.query(Incident).filter(Incident.status == "active").order_by(Incident.id.desc()).limit(5).all()
    for inc in active_incs:
        incident_list.append({
            "id": inc.id,
            "title": inc.title,
            "severity": inc.severity,
            "duration": inc.duration,
            "app_name": inc.app_name,
            "assignee": inc.assignee,
        })

    envs = db.query(Environment).all()
    env_health = [{"name": e.name, "score": e.health_score, "status": e.status, "app_count": e.app_count, "incident_count": e.incident_count} for e in envs]

    connectors = db.query(ConnectorInstance).limit(4).all()
    connector_health = [{"name": c.name, "status": c.status, "health_pct": c.health_pct, "category": c.category, "last_sync": c.last_sync} for c in connectors]

    insights = db.query(AiInsight).order_by(AiInsight.id.desc()).limit(3).all()
    ai_highlights = [{"id": i.id, "title": i.title, "type": i.insight_type, "priority": i.priority, "app_name": i.app_name, "confidence": i.confidence} for i in insights]

    heatmap_data = [
        {"region": "US-East", "production": 91, "staging": 97, "development": 99},
        {"region": "US-West", "production": 93, "staging": 98, "development": 99},
        {"region": "EU-West", "production": 87, "staging": 95, "development": 98},
        {"region": "AP-South", "production": 95, "staging": 99, "development": 100},
        {"region": "SA-East", "production": 89, "staging": 96, "development": 99},
    ]

    return {
        "total_apps": total,
        "healthy_apps": healthy,
        "degraded_apps": degraded,
        "critical_apps": critical,
        "avg_health_score": avg_score,
        "active_incidents": active_incidents,
        "active_alerts": active_alerts,
        "overall_uptime": avg_uptime,
        "avg_latency": avg_latency,
        "health_24h": health_24h,
        "top_impacted": top_impacted,
        "active_incident_list": incident_list,
        "environment_health": env_health,
        "connector_health": connector_health,
        "ai_highlights": ai_highlights,
        "heatmap_data": heatmap_data,
    }


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    apps = db.query(Application).all()
    total = len(apps)
    healthy = sum(1 for a in apps if a.status == "healthy")
    degraded = sum(1 for a in apps if a.status == "warning")
    critical = sum(1 for a in apps if a.status == "critical")
    avg_score = round(sum(a.health_score for a in apps) / total, 1) if total else 0
    active_incidents = db.query(Incident).filter(Incident.status == "active").count()
    active_alerts = db.query(Alert).filter(Alert.status == "firing").count()
    avg_uptime = round(sum(a.uptime for a in apps) / total, 2) if total else 0
    avg_latency = round(sum(a.latency_p99 for a in apps) / total, 1) if total else 0
    return {
        "total_apps": total,
        "healthy_apps": healthy,
        "degraded_apps": degraded,
        "critical_apps": critical,
        "avg_health_score": avg_score,
        "active_incidents": active_incidents,
        "active_alerts": active_alerts,
        "overall_uptime": avg_uptime,
        "avg_latency": avg_latency,
    }


@router.get("/top-impacted")
def get_top_impacted(db: Session = Depends(get_db)):
    apps = db.query(Application).all()
    critical_apps = sorted([a for a in apps if a.status in ("critical", "warning")], key=lambda x: x.health_score)
    return [
        {
            "id": a.id,
            "name": a.name,
            "score": a.health_score,
            "status": a.status,
            "trend": a.trend,
            "team_id": a.team_id,
            "latency": a.latency_p99,
            "uptime": a.uptime,
            "criticality": a.criticality,
        }
        for a in critical_apps[:10]
    ]


@router.get("/health-heatmap")
def get_health_heatmap(db: Session = Depends(get_db)):
    return [
        {"region": "US-East", "production": 91, "staging": 97, "development": 99},
        {"region": "US-West", "production": 93, "staging": 98, "development": 99},
        {"region": "EU-West", "production": 87, "staging": 95, "development": 98},
        {"region": "AP-South", "production": 95, "staging": 99, "development": 100},
        {"region": "SA-East", "production": 89, "staging": 96, "development": 99},
    ]


@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    snapshots = db.query(DashboardSnapshot).all()
    return [{"hour": s.hour_label, "score": s.health_score, "incidents": s.incidents, "alerts": s.alerts} for s in snapshots]
