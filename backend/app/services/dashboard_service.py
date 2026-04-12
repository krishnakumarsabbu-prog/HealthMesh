from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.repositories import (
    ApplicationRepository, IncidentRepository, AlertRepository,
    DashboardSnapshotRepository, AiInsightRepository,
    ConnectorInstanceRepository, TrendDataPointRepository
)
from app.models import Application, Incident, Alert, Environment


class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.app_repo = ApplicationRepository(db)
        self.incident_repo = IncidentRepository(db)
        self.alert_repo = AlertRepository(db)
        self.snapshot_repo = DashboardSnapshotRepository(db)
        self.insight_repo = AiInsightRepository(db)
        self.connector_repo = ConnectorInstanceRepository(db)
        self.trend_repo = TrendDataPointRepository(db)

    def _get_scoped_apps(self, app_ids: Optional[List[str]]) -> List[Application]:
        q = self.db.query(Application)
        if app_ids is not None:
            q = q.filter(Application.id.in_(app_ids))
        return q.all()

    def _count_active_incidents(self, app_ids: Optional[List[str]]) -> int:
        q = self.db.query(Incident).filter(Incident.status == "active")
        if app_ids is not None:
            q = q.filter(Incident.app_id.in_(app_ids))
        return q.count()

    def _count_firing_alerts(self, app_ids: Optional[List[str]]) -> int:
        q = self.db.query(Alert).filter(Alert.status == "firing")
        if app_ids is not None:
            q = q.filter(Alert.app_id.in_(app_ids))
        return q.count()

    def get_overview(self, app_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        apps = self._get_scoped_apps(app_ids)
        total = len(apps)
        healthy = sum(1 for a in apps if a.status == "healthy")
        degraded = sum(1 for a in apps if a.status == "warning")
        critical = sum(1 for a in apps if a.status == "critical")
        avg_score = round(sum(a.health_score for a in apps) / total, 1) if total else 0
        avg_uptime = round(sum(a.uptime for a in apps) / total, 2) if total else 0
        avg_latency = round(sum(a.latency_p99 for a in apps) / total, 1) if total else 0

        active_incidents = self._count_active_incidents(app_ids)
        active_alerts = self._count_firing_alerts(app_ids)

        snapshots = self.snapshot_repo.get_last_24h()
        health_24h = [{"hour": s.hour_label, "score": s.health_score, "incidents": s.incidents} for s in snapshots]

        top_impacted = self._get_top_impacted(app_ids=app_ids)
        active_incident_list = self._get_active_incidents(app_ids=app_ids)
        env_health = self._get_environment_health()
        connector_health = self._get_connector_health()
        ai_highlights = self._get_ai_highlights(app_ids=app_ids)
        heatmap_data = self._get_heatmap_data()

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
            "health_24h": health_24h,
            "top_impacted": top_impacted,
            "active_incident_list": active_incident_list,
            "environment_health": env_health,
            "connector_health": connector_health,
            "ai_highlights": ai_highlights,
            "heatmap_data": heatmap_data,
        }

    def get_summary(self, app_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        apps = self._get_scoped_apps(app_ids)
        total = len(apps)
        p0_apps = [a for a in apps if a.criticality == "P0"]
        p1_apps = [a for a in apps if a.criticality == "P1"]
        p2_apps = [a for a in apps if a.criticality == "P2"]

        return {
            "total_apps": total,
            "by_criticality": {
                "P0": len(p0_apps),
                "P1": len(p1_apps),
                "P2": len(p2_apps),
            },
            "by_status": {
                "healthy": sum(1 for a in apps if a.status == "healthy"),
                "warning": sum(1 for a in apps if a.status == "warning"),
                "critical": sum(1 for a in apps if a.status == "critical"),
            },
            "avg_health_score": round(sum(a.health_score for a in apps) / total, 1) if total else 0,
            "active_incidents": self._count_active_incidents(app_ids),
            "active_alerts": self._count_firing_alerts(app_ids),
        }

    def get_top_impacted(self, limit: int = 6, app_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        return self._get_top_impacted(limit, app_ids=app_ids)

    def get_health_heatmap(self) -> List[Dict[str, Any]]:
        return self._get_heatmap_data()

    def get_trends(self, app_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        snapshots = self.snapshot_repo.get_last_24h()
        return [
            {"hour": s.hour_label, "score": s.health_score, "incidents": s.incidents, "alerts": s.alerts}
            for s in snapshots
        ]

    def _get_top_impacted(self, limit: int = 6, app_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        q = self.db.query(Application).filter(Application.status.in_(["critical", "warning"])).order_by(Application.health_score.asc())
        if app_ids is not None:
            q = q.filter(Application.id.in_(app_ids))
        impacted = q.all()
        result = []
        for a in impacted[:limit]:
            result.append({
                "id": a.id,
                "name": a.name,
                "score": a.health_score,
                "status": a.status,
                "trend": a.trend,
                "team_id": a.team_id,
                "latency": a.latency_p99,
                "uptime": a.uptime,
                "criticality": a.criticality,
            })
        return result

    def _get_active_incidents(self, limit: int = 5, app_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        q = self.db.query(Incident).filter(Incident.status == "active").order_by(Incident.id.desc())
        if app_ids is not None:
            q = q.filter(Incident.app_id.in_(app_ids))
        incidents = q.all()
        return [
            {
                "id": inc.id,
                "title": inc.title,
                "severity": inc.severity,
                "duration": inc.duration,
                "app_name": inc.app_name,
                "assignee": inc.assignee,
            }
            for inc in incidents[:limit]
        ]

    def _get_environment_health(self) -> List[Dict[str, Any]]:
        envs = self.db.query(Environment).all()
        return [
            {
                "name": e.name,
                "score": e.health_score,
                "status": e.status,
                "app_count": e.app_count,
                "incident_count": e.incident_count,
            }
            for e in envs
        ]

    def _get_connector_health(self, limit: int = 4) -> List[Dict[str, Any]]:
        connectors = self.connector_repo.get_all(limit=limit)
        return [
            {
                "name": c.name,
                "status": c.status,
                "health_pct": c.health_pct,
                "category": c.category,
                "last_sync": c.last_sync,
            }
            for c in connectors
        ]

    def _get_ai_highlights(self, limit: int = 3, app_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        from app.models import AiInsight
        q = self.db.query(AiInsight).order_by(AiInsight.id.desc())
        if app_ids is not None:
            q = q.filter(AiInsight.app_id.in_(app_ids))
        insights = q.limit(limit).all()
        return [
            {
                "id": i.id,
                "title": i.title,
                "type": i.insight_type,
                "priority": i.priority,
                "app_name": i.app_name,
                "confidence": i.confidence,
            }
            for i in insights
        ]

    def _get_heatmap_data(self) -> List[Dict[str, Any]]:
        return [
            {"region": "US-East", "production": 91, "staging": 97, "development": 99},
            {"region": "US-West", "production": 93, "staging": 98, "development": 99},
            {"region": "EU-West", "production": 87, "staging": 95, "development": 98},
            {"region": "AP-South", "production": 95, "staging": 99, "development": 100},
            {"region": "SA-East", "production": 89, "staging": 96, "development": 99},
        ]
