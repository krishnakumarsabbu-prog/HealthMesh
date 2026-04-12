from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Incident, Alert


class IncidentService:
    def __init__(self, db: Session):
        self.db = db

    def list_incidents(self, status: Optional[str] = None, app_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        q = self.db.query(Incident)
        if app_ids is not None:
            q = q.filter(Incident.app_id.in_(app_ids))
        if status:
            q = q.filter(Incident.status == status)
        return [self._serialize_incident(i) for i in q.all()]

    def get_incident(self, incident_id: str, app_ids: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
        q = self.db.query(Incident).filter(Incident.id == incident_id)
        if app_ids is not None:
            q = q.filter(Incident.app_id.in_(app_ids))
        inc = q.first()
        if not inc:
            return None
        return self._serialize_incident(inc)

    def get_incidents_by_app(self, app_id: str) -> List[Dict[str, Any]]:
        incidents = self.db.query(Incident).filter(Incident.app_id == app_id).all()
        return [self._serialize_incident(i) for i in incidents]

    def list_alerts(self, status: Optional[str] = None, app_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        q = self.db.query(Alert)
        if app_ids is not None:
            q = q.filter(Alert.app_id.in_(app_ids))
        if status == "firing":
            q = q.filter(Alert.status == "firing")
        return [self._serialize_alert(a) for a in q.all()]

    def get_alerts_by_app(self, app_id: str) -> List[Dict[str, Any]]:
        alerts = self.db.query(Alert).filter(Alert.app_id == app_id).all()
        return [self._serialize_alert(a) for a in alerts]

    def get_summary(self, app_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        iq = self.db.query(Incident)
        aq = self.db.query(Alert)
        if app_ids is not None:
            iq = iq.filter(Incident.app_id.in_(app_ids))
            aq = aq.filter(Alert.app_id.in_(app_ids))
        return {
            "active_incidents": iq.filter(Incident.status == "active").count(),
            "firing_alerts": aq.filter(Alert.status == "firing").count(),
            "total_incidents": iq.count(),
            "total_alerts": aq.count(),
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
