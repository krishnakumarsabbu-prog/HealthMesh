from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/overview")
def get_overview(db: Session = Depends(get_db)):
    svc = DashboardService(db)
    return svc.get_overview()


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    svc = DashboardService(db)
    return svc.get_summary()


@router.get("/top-impacted")
def get_top_impacted(limit: int = 6, db: Session = Depends(get_db)):
    svc = DashboardService(db)
    return svc.get_top_impacted(limit)


@router.get("/health-heatmap")
def get_health_heatmap(db: Session = Depends(get_db)):
    svc = DashboardService(db)
    return svc.get_health_heatmap()


@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    svc = DashboardService(db)
    return svc.get_trends()
