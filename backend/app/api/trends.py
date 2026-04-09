from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import TrendService

router = APIRouter(prefix="/api/trends", tags=["trends"])


@router.get("/health")
def get_health_trends(period: str = "monthly", db: Session = Depends(get_db)):
    svc = TrendService(db)
    return svc.get_health_trends(period)


@router.get("/incidents")
def get_incident_trends(period: str = "monthly", db: Session = Depends(get_db)):
    svc = TrendService(db)
    return svc.get_incident_trends(period)


@router.get("/latency")
def get_latency_trends(period: str = "monthly", db: Session = Depends(get_db)):
    svc = TrendService(db)
    return svc.get_latency_trends(period)


@router.get("/errors")
def get_error_trends(period: str = "monthly", db: Session = Depends(get_db)):
    svc = TrendService(db)
    return svc.get_error_trends(period)
