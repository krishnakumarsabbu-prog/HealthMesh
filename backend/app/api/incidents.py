from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import IncidentService
from app.core.auth_deps import get_current_user, get_scoped_app_ids
from app.models.identity import User

router = APIRouter(prefix="/api", tags=["incidents"])


@router.get("/incidents")
def list_incidents(status: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app_ids = get_scoped_app_ids(current_user, db)
    svc = IncidentService(db)
    return svc.list_incidents(status=status, app_ids=app_ids)


@router.get("/incidents/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app_ids = get_scoped_app_ids(current_user, db)
    svc = IncidentService(db)
    result = svc.get_incident(incident_id, app_ids=app_ids)
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result


@router.put("/incidents/{incident_id}")
def update_incident(incident_id: str, payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models import Incident
    app_ids = get_scoped_app_ids(current_user, db)
    q = db.query(Incident).filter(Incident.id == incident_id)
    if app_ids is not None:
        q = q.filter(Incident.app_id.in_(app_ids))
    inc = q.first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    if "status" in payload:
        inc.status = payload["status"]
    if "assignee" in payload:
        inc.assignee = payload["assignee"]
    db.commit()
    db.refresh(inc)
    svc = IncidentService(db)
    return svc._serialize_incident(inc)


@router.get("/alerts")
def list_alerts(status: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app_ids = get_scoped_app_ids(current_user, db)
    svc = IncidentService(db)
    return svc.list_alerts(status=status, app_ids=app_ids)


@router.put("/alerts/{alert_id}")
def update_alert(alert_id: str, payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models import Alert
    app_ids = get_scoped_app_ids(current_user, db)
    q = db.query(Alert).filter(Alert.id == alert_id)
    if app_ids is not None:
        q = q.filter(Alert.app_id.in_(app_ids))
    alert = q.first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if "status" in payload:
        alert.status = payload["status"]
    db.commit()
    db.refresh(alert)
    svc = IncidentService(db)
    return svc._serialize_alert(alert)
