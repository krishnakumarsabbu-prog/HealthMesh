from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import ConnectorService
from app.core.auth_deps import get_current_user, require_role
from app.models.identity import User

router = APIRouter(prefix="/api/connectors", tags=["connectors"])

ROLE_HIERARCHY = {
    "LOB_ADMIN": 4,
    "TEAM_ADMIN": 3,
    "PROJECT_ADMIN": 2,
    "USER": 1,
}


def _resolve_scope_lob_id(current_user: User) -> str | None:
    if current_user.role_id == "LOB_ADMIN" and current_user.lob_id:
        return current_user.lob_id
    return None


def _assert_connector_owner(instance_id: str, current_user: User, svc: ConnectorService) -> None:
    instances = svc.list_instances()
    match = next((i for i in instances if i["id"] == instance_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Connector instance not found")
    user_level = ROLE_HIERARCHY.get(current_user.role_id, 0)
    if user_level >= ROLE_HIERARCHY["LOB_ADMIN"]:
        if current_user.lob_id and match.get("lob_id") and match["lob_id"] != current_user.lob_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only modify connectors owned by your LOB",
            )


@router.get("/templates")
def list_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = ConnectorService(db)
    return svc.list_templates()


@router.get("/instances")
def list_instances(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = ConnectorService(db)
    lob_id = _resolve_scope_lob_id(current_user)
    return svc.list_instances(lob_id=lob_id)


@router.post("/instances")
def create_instance(
    payload: dict,
    current_user: User = Depends(require_role("TEAM_ADMIN")),
    db: Session = Depends(get_db),
):
    svc = ConnectorService(db)
    if "lob_id" not in payload or payload.get("lob_id") is None:
        payload["lob_id"] = current_user.lob_id
    if "managed_by" not in payload or payload.get("managed_by") is None:
        payload["managed_by"] = getattr(current_user, "lob_name", None) or current_user.email
    result = svc.create_instance(payload)
    if not result:
        raise HTTPException(status_code=404, detail="Template not found")
    return result


@router.put("/instances/{instance_id}")
def update_instance(
    instance_id: str,
    payload: dict,
    current_user: User = Depends(require_role("TEAM_ADMIN")),
    db: Session = Depends(get_db),
):
    svc = ConnectorService(db)
    _assert_connector_owner(instance_id, current_user, svc)
    result = svc.update_instance(instance_id, payload)
    if not result:
        raise HTTPException(status_code=404, detail="Connector instance not found")
    return result


@router.delete("/instances/{instance_id}")
def delete_instance(
    instance_id: str,
    current_user: User = Depends(require_role("TEAM_ADMIN")),
    db: Session = Depends(get_db),
):
    svc = ConnectorService(db)
    _assert_connector_owner(instance_id, current_user, svc)
    deleted = svc.delete_instance(instance_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Connector instance not found")
    return {"deleted": True}


@router.post("/test")
def test_connector(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = ConnectorService(db)
    return svc.test_connection(payload)


@router.get("/health")
def get_connector_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = ConnectorService(db)
    return svc.get_health_summary()


@router.get("/{connector_id}/capabilities")
def get_capabilities(
    connector_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = ConnectorService(db)
    return svc.get_capabilities(connector_id)


@router.get("/{connector_id}/usage")
def get_usage(
    connector_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = ConnectorService(db)
    result = svc.get_usage(connector_id)
    if not result:
        raise HTTPException(status_code=404, detail="Connector not found")
    return result
