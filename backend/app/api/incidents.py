from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import Incident, Alert

router = APIRouter(prefix="/api", tags=["incidents"])


@router.get("/incidents")
def list_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    return [{"id": i.id, "app_id": i.app_id, "app_name": i.app_name, "title": i.title, "severity": i.severity, "status": i.status, "duration": i.duration, "assignee": i.assignee, "ai_cause": i.ai_cause, "health_impact": i.health_impact, "affected_deps": i.affected_deps, "timeline": i.timeline, "started_at": i.started_at, "resolved_at": i.resolved_at} for i in incidents]


@router.get("/incidents/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"id": inc.id, "app_id": inc.app_id, "app_name": inc.app_name, "title": inc.title, "severity": inc.severity, "status": inc.status, "duration": inc.duration, "assignee": inc.assignee, "ai_cause": inc.ai_cause, "health_impact": inc.health_impact, "affected_deps": inc.affected_deps, "timeline": inc.timeline, "started_at": inc.started_at, "resolved_at": inc.resolved_at}


@router.get("/alerts")
def list_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).all()
    return [{"id": a.id, "app_id": a.app_id, "app_name": a.app_name, "rule_name": a.rule_name, "metric": a.metric, "value": a.value, "threshold": a.threshold, "severity": a.severity, "status": a.status, "fired_at": a.fired_at, "environment": a.environment} for a in alerts]
