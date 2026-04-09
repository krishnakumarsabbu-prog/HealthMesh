from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import TrendDataPoint

router = APIRouter(prefix="/api/trends", tags=["trends"])


@router.get("/health")
def get_health_trends(period: str = "monthly", db: Session = Depends(get_db)):
    data = db.query(TrendDataPoint).filter(TrendDataPoint.period_type == period).all()
    return [{"label": d.label, "health_score": d.health_score, "availability": d.availability, "incidents": d.incidents, "latency": d.latency, "error_rate": d.error_rate, "mttr": d.mttr, "mttd": d.mttd} for d in data]


@router.get("/incidents")
def get_incident_trends(period: str = "monthly", db: Session = Depends(get_db)):
    data = db.query(TrendDataPoint).filter(TrendDataPoint.period_type == period).all()
    return [{"label": d.label, "incidents": d.incidents, "mttr": d.mttr, "mttd": d.mttd} for d in data]


@router.get("/latency")
def get_latency_trends(period: str = "monthly", db: Session = Depends(get_db)):
    data = db.query(TrendDataPoint).filter(TrendDataPoint.period_type == period).all()
    return [{"label": d.label, "latency": d.latency, "health_score": d.health_score} for d in data]


@router.get("/errors")
def get_error_trends(period: str = "monthly", db: Session = Depends(get_db)):
    data = db.query(TrendDataPoint).filter(TrendDataPoint.period_type == period).all()
    return [{"label": d.label, "error_rate": d.error_rate, "availability": d.availability} for d in data]
