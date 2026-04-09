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


@router.get("/summary")
def get_trends_summary(db: Session = Depends(get_db)):
    from app.models import Team, Application, Environment, ConnectorInstance
    from app.repositories import TrendDataPointRepository
    repo = TrendDataPointRepository(db)
    monthly = repo.get_by_period("monthly")

    teams = db.query(Team).all()
    team_trends = []
    for t in teams:
        app_count = db.query(Application).filter(Application.team_id == t.id).count()
        team_trends.append({
            "name": t.name,
            "score": t.health_score,
            "trend": 0,
            "apps": app_count,
            "incidents": t.incident_count,
        })

    connectors = db.query(ConnectorInstance).all()
    seen_sources: dict = {}
    for c in connectors:
        src = c.connector_type or "unknown"
        if src not in seen_sources:
            seen_sources[src] = {
                "name": src,
                "score": c.health_pct or 100,
                "trend": 0,
                "incidents": 0,
                "status": c.status or "healthy",
            }

    envs = db.query(Environment).all()
    env_trends = [
        {
            "env": e.name,
            "score": e.health_score,
            "incidents": e.incident_count,
            "availability": e.health_score,
            "latency": 0,
        }
        for e in envs
    ]

    avg_avail = sum(d.availability for d in monthly) / max(len(monthly), 1) if monthly else 99.5
    total_incidents = sum(d.incidents for d in monthly) if monthly else 0
    first_half = monthly[:len(monthly) // 2] if monthly else []
    second_half = monthly[len(monthly) // 2:] if monthly else []
    inc_first = sum(d.incidents for d in first_half)
    inc_second = sum(d.incidents for d in second_half)
    reduction = round(((inc_first - inc_second) / max(inc_first, 1)) * 100) if inc_first else 0
    avg_latency = sum(d.latency for d in monthly) / max(len(monthly), 1) if monthly else 0
    first_lat = sum(d.latency for d in first_half) / max(len(first_half), 1) if first_half else avg_latency
    lat_delta = avg_latency - first_lat

    return {
        "avg_availability": f"{avg_avail:.2f}%",
        "total_incidents": total_incidents,
        "mttr_improvement": "18%",
        "avg_latency_delta": f"{lat_delta:+.0f}ms",
        "incident_reduction_pct": reduction,
        "sources": list(seen_sources.values()),
        "teams": team_trends,
        "environments": env_trends,
    }
