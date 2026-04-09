import random
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.repositories import ApplicationRepository, IncidentRepository


class HealthScoreService:
    def __init__(self, db: Session):
        self.db = db
        self.app_repo = ApplicationRepository(db)
        self.incident_repo = IncidentRepository(db)

    def recalculate_app_score(self, app_id: str) -> Dict[str, Any]:
        app = self.app_repo.get(app_id)
        if not app:
            return {"error": "Application not found"}

        signals = self.app_repo.get_signals(app_id)
        incidents = self.incident_repo.get_by_app(app_id)
        active_incidents = [i for i in incidents if i.status == "active"]

        score = self._compute_score(app, signals, active_incidents)

        self.app_repo.update(app, {"health_score": score})

        return {
            "app_id": app_id,
            "previous_score": app.health_score,
            "new_score": score,
            "recalculated_at": "just now",
        }

    def recalculate_all(self) -> List[Dict[str, Any]]:
        apps = self.app_repo.get_all()
        results = []
        for app in apps:
            result = self.recalculate_app_score(app.id)
            results.append(result)
        return results

    def get_score_breakdown(self, app_id: str) -> Dict[str, Any]:
        app = self.app_repo.get(app_id)
        if not app:
            return {"error": "Application not found"}

        latency_score = self._latency_score(app.latency_p99)
        uptime_score = self._uptime_score(app.uptime)
        incident_score = self._incident_score(app.incident_count)

        return {
            "app_id": app_id,
            "overall": app.health_score,
            "components": {
                "latency": {"weight": 0.30, "score": latency_score, "value": f"{app.latency_p99}ms"},
                "uptime": {"weight": 0.25, "score": uptime_score, "value": f"{app.uptime}%"},
                "incidents": {"weight": 0.25, "score": incident_score, "value": app.incident_count},
                "errors": {"weight": 0.10, "score": 90.0, "value": "estimated"},
                "infra": {"weight": 0.10, "score": 85.0, "value": "estimated"},
            },
        }

    def _compute_score(self, app, signals, active_incidents) -> float:
        base = app.health_score
        noise = random.uniform(-1.5, 1.5)
        incident_penalty = len(active_incidents) * 3.0
        score = max(10.0, min(100.0, base + noise - incident_penalty))
        return round(score, 1)

    def _latency_score(self, latency_p99: float) -> float:
        if latency_p99 < 100:
            return 100.0
        elif latency_p99 < 300:
            return round(100.0 - (latency_p99 - 100) / 200 * 30, 1)
        elif latency_p99 < 500:
            return round(70.0 - (latency_p99 - 300) / 200 * 30, 1)
        else:
            return max(10.0, round(40.0 - (latency_p99 - 500) / 500 * 30, 1))

    def _uptime_score(self, uptime: float) -> float:
        if uptime >= 99.99:
            return 100.0
        elif uptime >= 99.9:
            return 95.0
        elif uptime >= 99.5:
            return 85.0
        elif uptime >= 99.0:
            return 70.0
        else:
            return max(10.0, uptime * 0.7)

    def _incident_score(self, incident_count: int) -> float:
        if incident_count == 0:
            return 100.0
        elif incident_count == 1:
            return 80.0
        elif incident_count <= 3:
            return 60.0
        else:
            return max(10.0, 60.0 - (incident_count - 3) * 10)
