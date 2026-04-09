from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import MaintenanceWindow, SLASetting, AuditLog

router = APIRouter(prefix="/api", tags=["settings"])


@router.get("/maintenance")
def list_maintenance_windows(db: Session = Depends(get_db)):
    windows = db.query(MaintenanceWindow).all()
    return [{"id": w.id, "title": w.title, "description": w.description, "start_time": w.start_time, "end_time": w.end_time, "affected_apps": w.affected_apps, "status": w.status, "created_by": w.created_by} for w in windows]


@router.post("/maintenance")
def create_maintenance_window(payload: dict, db: Session = Depends(get_db)):
    window = MaintenanceWindow(
        id=payload.get("id", f"mw-{db.query(MaintenanceWindow).count() + 10:03d}"),
        title=payload["title"],
        description=payload.get("description", ""),
        start_time=payload["start_time"],
        end_time=payload["end_time"],
        affected_apps=payload.get("affected_apps", []),
        status="scheduled",
        created_by=payload.get("created_by", "System"),
    )
    db.add(window)
    db.commit()
    db.refresh(window)
    return {"id": window.id}


@router.get("/sla")
def list_sla_settings(db: Session = Depends(get_db)):
    slas = db.query(SLASetting).all()
    return [{"id": s.id, "app_id": s.app_id, "name": s.name, "target_pct": s.target_pct, "current_pct": s.current_pct, "error_budget_remaining": s.error_budget_remaining, "period": s.period, "status": s.status} for s in slas]


@router.get("/audit")
def list_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()
    return [{"id": l.id, "user_name": l.user_name, "user_email": l.user_email, "action": l.action, "resource_type": l.resource_type, "resource_id": l.resource_id, "resource_name": l.resource_name, "details": l.details, "ip_address": l.ip_address, "timestamp": l.timestamp} for l in logs]
