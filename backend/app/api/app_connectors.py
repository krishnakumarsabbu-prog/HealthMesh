from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.health_check_orchestrator import HealthCheckOrchestrator
from app.core.auth_deps import get_current_user, get_scoped_app_ids
from app.models.identity import User

router = APIRouter(prefix="/api/apps", tags=["app-connectors"])


def _verify_app_access(app_id: str, current_user: User, db: Session):
    app_ids = get_scoped_app_ids(current_user, db)
    if app_ids is not None and app_id not in app_ids:
        raise HTTPException(status_code=403, detail="Access denied")


@router.get("/{app_id}/connectors")
def list_app_connectors(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _verify_app_access(app_id, current_user, db)
    orchestrator = HealthCheckOrchestrator(db)
    return orchestrator.get_app_connectors(app_id)


@router.post("/{app_id}/connectors")
def assign_connector_to_app(
    app_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _verify_app_access(app_id, current_user, db)
    connector_instance_id = payload.get("connector_instance_id")
    if not connector_instance_id:
        raise HTTPException(status_code=400, detail="connector_instance_id is required")
    poll_interval = payload.get("poll_interval_seconds", 60)
    orchestrator = HealthCheckOrchestrator(db)
    return orchestrator.assign_connector(
        app_id=app_id,
        connector_instance_id=connector_instance_id,
        assigned_by=current_user.email,
        poll_interval_seconds=poll_interval,
    )


@router.delete("/{app_id}/connectors/{connector_instance_id}")
def remove_connector_from_app(
    app_id: str,
    connector_instance_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _verify_app_access(app_id, current_user, db)
    orchestrator = HealthCheckOrchestrator(db)
    deleted = orchestrator.remove_connector(app_id, connector_instance_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Connector assignment not found")
    return {"deleted": True}


@router.post("/{app_id}/health/check")
def run_health_check(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _verify_app_access(app_id, current_user, db)
    orchestrator = HealthCheckOrchestrator(db)
    return orchestrator.run_health_check(app_id)


@router.get("/{app_id}/health/results")
def get_health_results(
    app_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _verify_app_access(app_id, current_user, db)
    orchestrator = HealthCheckOrchestrator(db)
    return orchestrator.get_latest_poll_results(app_id)
