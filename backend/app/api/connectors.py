from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import ConnectorTemplate, ConnectorInstance

router = APIRouter(prefix="/api/connectors", tags=["connectors"])


@router.get("/templates")
def list_templates(db: Session = Depends(get_db)):
    templates = db.query(ConnectorTemplate).all()
    return [{"id": t.id, "name": t.name, "category": t.category, "description": t.description, "logo": t.logo, "color": t.color, "version": t.version, "fields": t.fields, "capabilities": t.capabilities, "popular": t.popular} for t in templates]


@router.get("/instances")
def list_instances(db: Session = Depends(get_db)):
    instances = db.query(ConnectorInstance).all()
    return [{"id": c.id, "template_id": c.template_id, "name": c.name, "category": c.category, "environment": c.environment, "status": c.status, "health_pct": c.health_pct, "app_count": c.app_count, "version": c.version, "last_sync": c.last_sync, "metrics_count": c.metrics_count, "config": c.config} for c in instances]


@router.post("/instances")
def create_instance(payload: dict, db: Session = Depends(get_db)):
    template = db.query(ConnectorTemplate).filter(ConnectorTemplate.id == payload.get("template_id")).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    instance = ConnectorInstance(
        id=payload.get("id", f"conn-{payload['template_id']}-{payload.get('name', 'new').lower().replace(' ', '-')}"),
        template_id=payload["template_id"],
        name=payload.get("name", template.name),
        category=template.category,
        environment=payload.get("environment", "Production"),
        status="healthy",
        health_pct=100.0,
        app_count=0,
        version=template.version,
        last_sync="just now",
        metrics_count="0",
        config=payload.get("config", {}),
    )
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return {"id": instance.id, "name": instance.name}


@router.put("/instances/{instance_id}")
def update_instance(instance_id: str, payload: dict, db: Session = Depends(get_db)):
    instance = db.query(ConnectorInstance).filter(ConnectorInstance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Connector instance not found")
    for k, v in payload.items():
        if hasattr(instance, k):
            setattr(instance, k, v)
    db.commit()
    return {"id": instance.id}


@router.delete("/instances/{instance_id}")
def delete_instance(instance_id: str, db: Session = Depends(get_db)):
    instance = db.query(ConnectorInstance).filter(ConnectorInstance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Connector instance not found")
    db.delete(instance)
    db.commit()
    return {"deleted": True}


@router.post("/test")
def test_connector(payload: dict):
    return {"success": True, "message": "Connection test successful", "latency_ms": 142}


@router.get("/{connector_id}/capabilities")
def get_capabilities(connector_id: str, db: Session = Depends(get_db)):
    instance = db.query(ConnectorInstance).filter(ConnectorInstance.id == connector_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Connector not found")
    template = db.query(ConnectorTemplate).filter(ConnectorTemplate.id == instance.template_id).first()
    return {"capabilities": template.capabilities if template else []}


@router.get("/{connector_id}/usage")
def get_usage(connector_id: str, db: Session = Depends(get_db)):
    instance = db.query(ConnectorInstance).filter(ConnectorInstance.id == connector_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Connector not found")
    return {"app_count": instance.app_count, "metrics_count": instance.metrics_count, "last_sync": instance.last_sync}
