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


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    apps = db.query(Application).all()
    total = len(apps)
    healthy = sum(1 for a in apps if a.status == "healthy")
    degraded = sum(1 for a in apps if a.status == "warning")
    critical = sum(1 for a in apps if a.status == "critical")
    avg_score = round(sum(a.health_score for a in apps) / total, 1) if total else 0
    active_incidents = db.query(Incident).filter(Incident.status == "active").count()
    active_alerts = db.query(Alert).filter(Alert.status == "firing").count()
    avg_uptime = round(sum(a.uptime for a in apps) / total, 2) if total else 0
    avg_latency = round(sum(a.latency_p99 for a in apps) / total, 1) if total else 0
    return {
        "total_apps": total,
        "healthy_apps": healthy,
        "degraded_apps": degraded,
        "critical_apps": critical,
        "avg_health_score": avg_score,
        "active_incidents": active_incidents,
        "active_alerts": active_alerts,
        "overall_uptime": avg_uptime,
        "avg_latency": avg_latency,
    }


@router.get("/top-impacted")
def get_top_impacted(db: Session = Depends(get_db)):
    apps = db.query(Application).all()
    critical_apps = sorted([a for a in apps if a.status in ("critical", "warning")], key=lambda x: x.health_score)
    return [
        {
            "id": a.id,
            "name": a.name,
            "score": a.health_score,
            "status": a.status,
            "trend": a.trend,
            "team_id": a.team_id,
            "latency": a.latency_p99,
            "uptime": a.uptime,
            "criticality": a.criticality,
        }
        for a in critical_apps[:10]
    ]


@router.get("/health-heatmap")
def get_health_heatmap(db: Session = Depends(get_db)):
    return [
        {"region": "US-East", "production": 91, "staging": 97, "development": 99},
        {"region": "US-West", "production": 93, "staging": 98, "development": 99},
        {"region": "EU-West", "production": 87, "staging": 95, "development": 98},
        {"region": "AP-South", "production": 95, "staging": 99, "development": 100},
        {"region": "SA-East", "production": 89, "staging": 96, "development": 99},
    ]


@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    svc = DashboardService(db)
    return svc.get_trends()
