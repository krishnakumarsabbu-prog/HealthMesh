from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import DashboardService
from app.core.auth_deps import get_current_user, get_scoped_app_ids
from app.models.identity import User

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/overview")
def get_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app_ids = get_scoped_app_ids(current_user, db)
    svc = DashboardService(db)
    return svc.get_overview(app_ids=app_ids)


@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app_ids = get_scoped_app_ids(current_user, db)
    svc = DashboardService(db)
    return svc.get_summary(app_ids=app_ids)


@router.get("/top-impacted")
def get_top_impacted(limit: int = 6, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app_ids = get_scoped_app_ids(current_user, db)
    svc = DashboardService(db)
    return svc.get_top_impacted(limit, app_ids=app_ids)


@router.get("/health-heatmap")
def get_health_heatmap(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    svc = DashboardService(db)
    return svc.get_health_heatmap()


@router.get("/trends")
def get_trends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app_ids = get_scoped_app_ids(current_user, db)
    svc = DashboardService(db)
    return svc.get_trends(app_ids=app_ids)
