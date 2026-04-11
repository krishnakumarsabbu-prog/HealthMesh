from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models import (
    Application, AppSignal, AppTransaction, AppLogPattern,
    AppInfraPod, AppDependency, AppEndpoint, AppHealthScore,
    Incident, HealthRule, AppHealthRule, AiInsight, ConnectorInstance
)
from app.models.identity import User, OrgTeam, Project
from app.schemas.apps import ApplicationOut, ApplicationCreate
from app.core.auth_deps import get_optional_user
import math, random

router = APIRouter(prefix="/api/apps", tags=["applications"])


def _generate_timeseries(base: float, points: int, noise: float = 5.0):
    result = []
    for i in range(points):
        val = base + noise * math.sin(i * math.pi / 12) + random.uniform(-noise * 0.3, noise * 0.3)
        result.append(round(val, 1))
    return result


@router.get("")
def list_apps(db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_user)):
    query = db.query(Application)
    if current_user:
        role = current_user.role_id
        if role == "USER" or role == "PROJECT_ADMIN":
            if current_user.project_id:
                query = query.filter(Application.project_id == current_user.project_id)
        elif role == "TEAM_ADMIN":
            if current_user.team_id:
                team_project_ids = [p.id for p in db.query(Project).filter(Project.team_id == current_user.team_id).all()]
                query = query.filter(Application.project_id.in_(team_project_ids))
        elif role == "LOB_ADMIN":
            if current_user.lob_id:
                lob_team_ids = [t.id for t in db.query(OrgTeam).filter(OrgTeam.lob_id == current_user.lob_id).all()]
                lob_project_ids = [p.id for p in db.query(Project).filter(Project.team_id.in_(lob_team_ids)).all()]
                query = query.filter(Application.project_id.in_(lob_project_ids))
    apps = query.all()
    result = []
    for a in apps:
        result.append({
            "id": a.id,
            "name": a.name,
            "description": a.description,
            "team_id": a.team_id,
            "environment": a.environment,
            "status": a.status,
            "criticality": a.criticality,
            "health_score": a.health_score,
            "uptime": a.uptime,
            "latency_p99": a.latency_p99,
            "rpm": a.rpm,
            "app_type": a.app_type,
            "runtime": a.runtime,
            "version": a.version,
            "platform": a.platform,
            "tags": a.tags,
            "incident_count": a.incident_count,
            "dependency_count": a.dependency_count,
            "connector_count": a.connector_count,
            "trend": a.trend,
            "owner_name": a.owner_name,
            "project_id": a.project_id,
        })
    return result


@router.get("/{app_id}")
def get_app(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return {
        "id": app.id,
        "name": app.name,
        "description": app.description,
        "team_id": app.team_id,
        "environment": app.environment,
        "status": app.status,
        "criticality": app.criticality,
        "health_score": app.health_score,
        "uptime": app.uptime,
        "latency_p99": app.latency_p99,
        "rpm": app.rpm,
        "app_type": app.app_type,
        "runtime": app.runtime,
        "version": app.version,
        "platform": app.platform,
        "tags": app.tags,
        "incident_count": app.incident_count,
        "dependency_count": app.dependency_count,
        "connector_count": app.connector_count,
        "trend": app.trend,
        "owner_name": app.owner_name,
        "project_id": app.project_id,
    }


@router.get("/{app_id}/overview")
def get_app_overview(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    health_scores = db.query(AppHealthScore).filter(AppHealthScore.app_id == app_id).all()
    if not health_scores:
        health_scores_data = [{"label": f"D-{28-i}", "score": round(app.health_score + random.uniform(-5, 5), 1)} for i in range(28)]
        health_scores_data.append({"label": "Today", "score": app.health_score})
    else:
        health_scores_data = [{"label": h.label, "score": h.score} for h in health_scores]

    base_latency = app.latency_p99
    latency_24h = []
    throughput_24h = []
    error_rate_24h = []
    base_rpm = app.rpm
    for i in range(48):
        t = i * 0.5
        l_val = base_latency * (1 + 0.2 * math.sin(t * math.pi / 12)) + random.uniform(-base_latency * 0.05, base_latency * 0.05)
        latency_24h.append({"t": f"{int(t):02d}:{int((t % 1) * 60):02d}", "p50": round(l_val * 0.6, 1), "p95": round(l_val * 0.85, 1), "p99": round(l_val, 1)})
        rpm_val = base_rpm * (1 + 0.15 * math.sin(t * math.pi / 12)) + random.uniform(-base_rpm * 0.03, base_rpm * 0.03)
        throughput_24h.append({"t": f"{int(t):02d}:{int((t % 1) * 60):02d}", "rpm": round(rpm_val, 0)})
        base_err = 0.05 if app.status == "healthy" else (1.5 if app.status == "critical" else 0.3)
        err_val = base_err * (1 + 0.3 * math.sin(t * math.pi / 8)) + random.uniform(0, base_err * 0.2)
        error_rate_24h.append({"t": f"{int(t):02d}:{int((t % 1) * 60):02d}", "rate": round(err_val, 3)})

    return {
        "app": {
            "id": app.id, "name": app.name, "description": app.description,
            "team_id": app.team_id, "environment": app.environment, "status": app.status,
            "criticality": app.criticality, "health_score": app.health_score,
            "uptime": app.uptime, "latency_p99": app.latency_p99, "rpm": app.rpm,
            "app_type": app.app_type, "runtime": app.runtime, "version": app.version,
            "platform": app.platform, "tags": app.tags, "owner_name": app.owner_name,
        },
        "health_history": health_scores_data,
        "latency_24h": latency_24h,
        "throughput_24h": throughput_24h,
        "error_rate_24h": error_rate_24h,
    }


@router.get("/{app_id}/signals")
def get_app_signals(app_id: str, db: Session = Depends(get_db)):
    signals = db.query(AppSignal).filter(AppSignal.app_id == app_id).all()
    if not signals:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        return [
            {"id": 1, "app_id": app_id, "category": "APM", "name": "P99 Latency", "value": str(round(app.latency_p99)), "unit": "ms", "status": app.status, "trend": "stable", "delta": "0ms", "source": "Datadog"},
            {"id": 2, "app_id": app_id, "category": "APM", "name": "Error Rate", "value": "0.1", "unit": "%", "status": "healthy", "trend": "stable", "delta": "0%", "source": "Datadog"},
            {"id": 3, "app_id": app_id, "category": "Infra", "name": "CPU", "value": "60", "unit": "%", "status": "healthy", "trend": "stable", "delta": "0%", "source": "Prometheus"},
        ]
    return [{"id": s.id, "app_id": s.app_id, "category": s.category, "name": s.name, "value": s.value, "unit": s.unit, "status": s.status, "trend": s.trend, "delta": s.delta, "source": s.source} for s in signals]


@router.get("/{app_id}/transactions")
def get_app_transactions(app_id: str, db: Session = Depends(get_db)):
    txns = db.query(AppTransaction).filter(AppTransaction.app_id == app_id).all()
    return [{"id": t.id, "app_id": t.app_id, "endpoint": t.endpoint, "rpm": t.rpm, "latency_p99": t.latency_p99, "error_rate": t.error_rate, "apdex": t.apdex, "status": t.status} for t in txns]


@router.get("/{app_id}/logs")
def get_app_logs(app_id: str, db: Session = Depends(get_db)):
    logs = db.query(AppLogPattern).filter(AppLogPattern.app_id == app_id).all()
    return [{"id": l.id, "app_id": l.app_id, "level": l.level, "message": l.message, "count": l.count, "first_seen": l.first_seen, "last_seen": l.last_seen} for l in logs]


@router.get("/{app_id}/infra")
def get_app_infra(app_id: str, db: Session = Depends(get_db)):
    pods = db.query(AppInfraPod).filter(AppInfraPod.app_id == app_id).all()
    if not pods:
        app = db.query(Application).filter(Application.id == app_id).first()
        if app:
            return [{"id": 1, "app_id": app_id, "pod_name": f"{app_id}-pod-1", "node": "node-01", "cpu_pct": 55, "mem_pct": 62, "restarts": 0, "age": "5d", "status": "Running"}]
    return [{"id": p.id, "app_id": p.app_id, "pod_name": p.pod_name, "node": p.node, "cpu_pct": p.cpu_pct, "mem_pct": p.mem_pct, "restarts": p.restarts, "age": p.age, "status": p.status} for p in pods]


@router.get("/{app_id}/apis")
def get_app_endpoints(app_id: str, db: Session = Depends(get_db)):
    endpoints = db.query(AppEndpoint).filter(AppEndpoint.app_id == app_id).all()
    if not endpoints:
        txns = db.query(AppTransaction).filter(AppTransaction.app_id == app_id).all()
        return [{"id": i, "app_id": app_id, "method": "GET", "path": t.endpoint.split(" ")[-1] if " " in t.endpoint else t.endpoint, "status": t.status, "rpm": t.rpm, "latency_p99": t.latency_p99, "error_rate": t.error_rate, "version": "v1", "auth": "JWT"} for i, t in enumerate(txns)]
    return [{"id": e.id, "app_id": e.app_id, "method": e.method, "path": e.path, "status": e.status, "rpm": e.rpm, "latency_p99": e.latency_p99, "error_rate": e.error_rate, "version": e.version, "auth": e.auth} for e in endpoints]


@router.get("/{app_id}/dependencies")
def get_app_dependencies(app_id: str, db: Session = Depends(get_db)):
    deps = db.query(AppDependency).filter(AppDependency.app_id == app_id).all()
    return [{"id": d.id, "app_id": d.app_id, "dep_name": d.dep_name, "dep_type": d.dep_type, "status": d.status, "latency": d.latency, "error_rate": d.error_rate} for d in deps]


@router.get("/{app_id}/incidents")
def get_app_incidents(app_id: str, db: Session = Depends(get_db)):
    incidents = db.query(Incident).filter(Incident.app_id == app_id).all()
    return [{"id": inc.id, "app_id": inc.app_id, "app_name": inc.app_name, "title": inc.title, "severity": inc.severity, "status": inc.status, "duration": inc.duration, "assignee": inc.assignee, "ai_cause": inc.ai_cause, "health_impact": inc.health_impact, "affected_deps": inc.affected_deps, "timeline": inc.timeline, "started_at": inc.started_at, "resolved_at": inc.resolved_at} for inc in incidents]


@router.get("/{app_id}/rules")
def get_app_rules(app_id: str, db: Session = Depends(get_db)):
    app_rules = db.query(AppHealthRule).filter(AppHealthRule.app_id == app_id).all()
    if app_rules:
        rules = [r.rule for r in app_rules]
    else:
        rules = db.query(HealthRule).limit(5).all()
    return [{"id": r.id, "name": r.name, "metric": r.metric, "operator": r.operator, "threshold": r.threshold, "severity": r.severity, "enabled": r.enabled, "scope": r.scope, "trigger_count": r.trigger_count, "tags": r.tags, "version": r.version, "last_triggered": r.last_triggered, "description": r.description} for r in rules]


@router.get("/{app_id}/ai-summary")
def get_app_ai_summary(app_id: str, db: Session = Depends(get_db)):
    insights = db.query(AiInsight).filter(AiInsight.app_id == app_id).all()
    return [{"id": i.id, "insight_type": i.insight_type, "priority": i.priority, "title": i.title, "description": i.description, "confidence": i.confidence, "impact": i.impact, "recommendation": i.recommendation, "signals": i.signals, "what_changed": i.what_changed, "generated_at": i.generated_at} for i in insights]


@router.get("/{app_id}/configuration")
def get_app_configuration(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    connectors = db.query(ConnectorInstance).limit(3).all()
    return {
        "app_id": app_id,
        "name": app.name,
        "runtime": app.runtime,
        "version": app.version,
        "platform": app.platform,
        "environment": app.environment,
        "criticality": app.criticality,
        "tags": app.tags,
        "owner_name": app.owner_name,
        "connectors": [{"id": c.id, "name": c.name, "category": c.category, "status": c.status} for c in connectors],
        "health_weights": {"latency": 30, "errors": 25, "availability": 25, "infra": 10, "incidents": 10},
        "thresholds": {"latency_warn": 300, "latency_crit": 500, "error_rate_warn": 0.5, "error_rate_crit": 1.0},
    }


@router.get("/{app_id}/health-history")
def get_app_health_history(app_id: str, db: Session = Depends(get_db)):
    scores = db.query(AppHealthScore).filter(AppHealthScore.app_id == app_id).all()
    if not scores:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        return [{"label": f"D-{28-i}", "score": round(app.health_score + random.uniform(-5, 5), 1)} for i in range(28)] + [{"label": "Today", "score": app.health_score}]
    return [{"label": s.label, "score": s.score} for s in scores]


@router.post("")
def create_app(payload: ApplicationCreate, db: Session = Depends(get_db)):
    app = Application(**payload.model_dump(), trend=[], tags=payload.tags)
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"id": app.id, "name": app.name}


@router.put("/{app_id}")
def update_app(app_id: str, payload: dict, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    for k, v in payload.items():
        if hasattr(app, k):
            setattr(app, k, v)
    db.commit()
    return {"id": app.id}


@router.delete("/{app_id}")
def delete_app(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
    return {"deleted": True}
