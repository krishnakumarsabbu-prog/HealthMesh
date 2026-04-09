from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import SettingsService

router = APIRouter(prefix="/api", tags=["settings"])


@router.get("/maintenance")
def list_maintenance_windows(status: str = None, db: Session = Depends(get_db)):
    svc = SettingsService(db)
    return svc.list_maintenance_windows(status=status)


@router.post("/maintenance")
def create_maintenance_window(payload: dict, db: Session = Depends(get_db)):
    svc = SettingsService(db)
    return svc.create_maintenance_window(payload)


@router.get("/sla")
def list_sla_settings(db: Session = Depends(get_db)):
    svc = SettingsService(db)
    return svc.list_sla_settings()


@router.get("/audit")
def list_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    svc = SettingsService(db)
    return svc.list_audit_logs(limit=limit)
