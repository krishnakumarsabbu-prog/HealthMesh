from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import AiInsightService
from app.core.auth_deps import get_current_user, get_scoped_app_ids
from app.models.identity import User

router = APIRouter(prefix="/api/ai", tags=["ai-insights"])


@router.get("/insights")
def list_insights(priority: str = None, insight_type: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app_ids = get_scoped_app_ids(current_user, db)
    svc = AiInsightService(db)
    return svc.list_insights(priority=priority, insight_type=insight_type, app_ids=app_ids)


@router.get("/insights/{app_id}")
def get_insights_by_app(app_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app_ids = get_scoped_app_ids(current_user, db)
    if app_ids is not None and app_id not in app_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    svc = AiInsightService(db)
    return svc.get_insights_by_app(app_id)
