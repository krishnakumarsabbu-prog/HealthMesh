from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import HealthRule
from app.schemas.common import HealthRuleCreate

router = APIRouter(prefix="/api/rules", tags=["health-rules"])


@router.get("")
def list_rules(db: Session = Depends(get_db)):
    rules = db.query(HealthRule).all()
    return [{"id": r.id, "name": r.name, "metric": r.metric, "operator": r.operator, "threshold": r.threshold, "severity": r.severity, "enabled": r.enabled, "scope": r.scope, "trigger_count": r.trigger_count, "tags": r.tags, "version": r.version, "last_triggered": r.last_triggered, "description": r.description} for r in rules]


@router.post("")
def create_rule(payload: HealthRuleCreate, db: Session = Depends(get_db)):
    rule = HealthRule(**payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return {"id": rule.id}


@router.put("/{rule_id}")
def update_rule(rule_id: str, payload: dict, db: Session = Depends(get_db)):
    rule = db.query(HealthRule).filter(HealthRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    for k, v in payload.items():
        if hasattr(rule, k):
            setattr(rule, k, v)
    db.commit()
    return {"id": rule.id}


@router.delete("/{rule_id}")
def delete_rule(rule_id: str, db: Session = Depends(get_db)):
    rule = db.query(HealthRule).filter(HealthRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"deleted": True}
