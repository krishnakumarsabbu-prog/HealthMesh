from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import SettingsService
from app.core.auth_deps import get_current_user, require_role
from app.models.identity import User

router = APIRouter(prefix="/api", tags=["settings"])


@router.get("/maintenance")
def list_maintenance_windows(
    status: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = SettingsService(db)
    return svc.list_maintenance_windows(status=status)


@router.post("/maintenance")
def create_maintenance_window(
    payload: dict,
    current_user: User = Depends(require_role("TEAM_ADMIN")),
    db: Session = Depends(get_db),
):
    svc = SettingsService(db)
    return svc.create_maintenance_window(payload)


@router.get("/sla")
def list_sla_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = SettingsService(db)
    return svc.list_sla_settings()


@router.get("/audit")
def list_audit_logs(
    limit: int = 100,
    current_user: User = Depends(require_role("LOB_ADMIN")),
    db: Session = Depends(get_db),
):
    svc = SettingsService(db)
    lob_id = current_user.lob_id if current_user.role_id == "LOB_ADMIN" else None
    return svc.list_audit_logs(limit=limit, lob_id=lob_id)
