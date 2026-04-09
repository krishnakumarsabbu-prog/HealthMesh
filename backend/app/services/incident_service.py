from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories import IncidentRepository, AlertRepository


class IncidentService:
    def __init__(self, db: Session):
        self.db = db
        self.incident_repo = IncidentRepository(db)
        self.alert_repo = AlertRepository(db)

    def list_incidents(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if status:
            incidents = self.incident_repo.get_by_status(status)
        else:
            incidents = self.incident_repo.get_all()
        return [self._serialize_incident(i) for i in incidents]

    def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        inc = self.incident_repo.get(incident_id)
        if not inc:
            return None
        return self._serialize_incident(inc)

    def get_incidents_by_app(self, app_id: str) -> List[Dict[str, Any]]:
        incidents = self.incident_repo.get_by_app(app_id)
        return [self._serialize_incident(i) for i in incidents]

    def list_alerts(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if status == "firing":
            alerts = self.alert_repo.get_firing()
        else:
            alerts = self.alert_repo.get_all()
        return [self._serialize_alert(a) for a in alerts]

    def get_alerts_by_app(self, app_id: str) -> List[Dict[str, Any]]:
        alerts = self.alert_repo.get_by_app(app_id)
        return [self._serialize_alert(a) for a in alerts]

    def get_summary(self) -> Dict[str, Any]:
        return {
            "active_incidents": self.incident_repo.count_active(),
            "firing_alerts": self.alert_repo.count_firing(),
            "total_incidents": self.incident_repo.count(),
            "total_alerts": self.alert_repo.count(),
        }

    def _serialize_incident(self, inc) -> Dict[str, Any]:
        return {
            "id": inc.id,
            "app_id": inc.app_id,
            "app_name": inc.app_name,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "duration": inc.duration,
            "assignee": inc.assignee,
            "ai_cause": inc.ai_cause,
            "health_impact": inc.health_impact,
            "affected_deps": inc.affected_deps,
            "timeline": inc.timeline,
            "started_at": inc.started_at,
            "resolved_at": inc.resolved_at,
        }

    def _serialize_alert(self, a) -> Dict[str, Any]:
        return {
            "id": a.id,
            "app_id": a.app_id,
            "app_name": a.app_name,
            "rule_name": a.rule_name,
            "metric": a.metric,
            "value": a.value,
            "threshold": a.threshold,
            "severity": a.severity,
            "status": a.status,
            "fired_at": a.fired_at,
            "environment": a.environment,
        }
