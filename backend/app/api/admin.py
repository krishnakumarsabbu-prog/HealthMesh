from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import HealthScoreService
from app.jobs import recalculate_all_health_scores, group_alerts, take_dashboard_snapshot

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/simulate-refresh")
def simulate_refresh(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    background_tasks.add_task(recalculate_all_health_scores)
    background_tasks.add_task(group_alerts)
    background_tasks.add_task(take_dashboard_snapshot)
    return {
        "status": "queued",
        "message": "Health scores, alert grouping, and dashboard snapshot refresh triggered",
        "jobs": ["health_score_recalculation", "alert_grouping", "dashboard_snapshot"],
    }


@router.post("/recalculate-health-scores")
def recalculate_health_scores(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    svc = HealthScoreService(db)
    results = svc.recalculate_all()
    return {
        "status": "complete",
        "apps_updated": len(results),
        "results": results[:10],
    }


@router.get("/system-status")
def get_system_status(db: Session = Depends(get_db)):
    from app.models import Application, Incident, Alert, ConnectorInstance
    app_count = db.query(Application).count()
    incident_count = db.query(Incident).count()
    alert_count = db.query(Alert).count()
    connector_count = db.query(ConnectorInstance).count()
    return {
        "status": "operational",
        "database": "connected",
        "counts": {
            "applications": app_count,
            "incidents": incident_count,
            "alerts": alert_count,
            "connectors": connector_count,
        },
    }
