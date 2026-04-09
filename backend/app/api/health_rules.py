from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import RuleService

router = APIRouter(prefix="/api/rules", tags=["health-rules"])


@router.get("")
def list_rules(enabled_only: bool = False, db: Session = Depends(get_db)):
    svc = RuleService(db)
    return svc.list_rules(enabled_only=enabled_only)


@router.post("")
def create_rule(payload: dict, db: Session = Depends(get_db)):
    svc = RuleService(db)
    return svc.create_rule(payload)


@router.put("/{rule_id}")
def update_rule(rule_id: str, payload: dict, db: Session = Depends(get_db)):
    svc = RuleService(db)
    result = svc.update_rule(rule_id, payload)
    if not result:
        raise HTTPException(status_code=404, detail="Rule not found")
    return result


@router.delete("/{rule_id}")
def delete_rule(rule_id: str, db: Session = Depends(get_db)):
    svc = RuleService(db)
    deleted = svc.delete_rule(rule_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"deleted": True}
