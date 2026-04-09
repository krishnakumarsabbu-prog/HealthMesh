from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import IncidentService

router = APIRouter(prefix="/api", tags=["incidents"])


@router.get("/incidents")
def list_incidents(status: str = None, db: Session = Depends(get_db)):
    svc = IncidentService(db)
    return svc.list_incidents(status=status)


@router.get("/incidents/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    svc = IncidentService(db)
    result = svc.get_incident(incident_id)
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result


@router.get("/alerts")
def list_alerts(status: str = None, db: Session = Depends(get_db)):
    svc = IncidentService(db)
    return svc.list_alerts(status=status)
