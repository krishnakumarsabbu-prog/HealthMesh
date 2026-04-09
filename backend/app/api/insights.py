from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import AiInsight

router = APIRouter(prefix="/api/ai", tags=["ai-insights"])


@router.get("/insights")
def list_insights(db: Session = Depends(get_db)):
    insights = db.query(AiInsight).all()
    return [{"id": i.id, "app_id": i.app_id, "app_name": i.app_name, "insight_type": i.insight_type, "priority": i.priority, "title": i.title, "description": i.description, "confidence": i.confidence, "impact": i.impact, "recommendation": i.recommendation, "signals": i.signals, "what_changed": i.what_changed, "generated_at": i.generated_at} for i in insights]


@router.get("/insights/{app_id}")
def get_insights_by_app(app_id: str, db: Session = Depends(get_db)):
    insights = db.query(AiInsight).filter(AiInsight.app_id == app_id).all()
    return [{"id": i.id, "app_id": i.app_id, "app_name": i.app_name, "insight_type": i.insight_type, "priority": i.priority, "title": i.title, "description": i.description, "confidence": i.confidence, "impact": i.impact, "recommendation": i.recommendation, "signals": i.signals, "what_changed": i.what_changed, "generated_at": i.generated_at} for i in insights]
