from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import AiInsightService

router = APIRouter(prefix="/api/ai", tags=["ai-insights"])


@router.get("/insights")
def list_insights(priority: str = None, insight_type: str = None, db: Session = Depends(get_db)):
    svc = AiInsightService(db)
    return svc.list_insights(priority=priority, insight_type=insight_type)


@router.get("/insights/{app_id}")
def get_insights_by_app(app_id: str, db: Session = Depends(get_db)):
    svc = AiInsightService(db)
    return svc.get_insights_by_app(app_id)
