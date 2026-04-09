from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import ConnectorService

router = APIRouter(prefix="/api/connectors", tags=["connectors"])


@router.get("/templates")
def list_templates(db: Session = Depends(get_db)):
    svc = ConnectorService(db)
    return svc.list_templates()


@router.get("/instances")
def list_instances(db: Session = Depends(get_db)):
    svc = ConnectorService(db)
    return svc.list_instances()


@router.post("/instances")
def create_instance(payload: dict, db: Session = Depends(get_db)):
    svc = ConnectorService(db)
    result = svc.create_instance(payload)
    if not result:
        raise HTTPException(status_code=404, detail="Template not found")
    return result


@router.put("/instances/{instance_id}")
def update_instance(instance_id: str, payload: dict, db: Session = Depends(get_db)):
    svc = ConnectorService(db)
    result = svc.update_instance(instance_id, payload)
    if not result:
        raise HTTPException(status_code=404, detail="Connector instance not found")
    return result


@router.delete("/instances/{instance_id}")
def delete_instance(instance_id: str, db: Session = Depends(get_db)):
    svc = ConnectorService(db)
    deleted = svc.delete_instance(instance_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Connector instance not found")
    return {"deleted": True}


@router.post("/test")
def test_connector(payload: dict, db: Session = Depends(get_db)):
    svc = ConnectorService(db)
    return svc.test_connection(payload)


@router.get("/health")
def get_connector_health(db: Session = Depends(get_db)):
    svc = ConnectorService(db)
    return svc.get_health_summary()


@router.get("/{connector_id}/capabilities")
def get_capabilities(connector_id: str, db: Session = Depends(get_db)):
    svc = ConnectorService(db)
    return svc.get_capabilities(connector_id)


@router.get("/{connector_id}/usage")
def get_usage(connector_id: str, db: Session = Depends(get_db)):
    svc = ConnectorService(db)
    result = svc.get_usage(connector_id)
    if not result:
        raise HTTPException(status_code=404, detail="Connector not found")
    return result
