import math
import random
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.repositories import ApplicationRepository
from app.models import Application


class AppService:
    def __init__(self, db: Session):
        self.repo = ApplicationRepository(db)
        self.db = db

    def list_apps(self) -> List[Dict[str, Any]]:
        apps = self.repo.get_all()
        return [self._serialize_app(a) for a in apps]

    def get_app(self, app_id: str) -> Optional[Dict[str, Any]]:
        app = self.repo.get(app_id)
        if not app:
            return None
        return self._serialize_app(app)

    def get_app_overview(self, app_id: str) -> Optional[Dict[str, Any]]:
        app = self.repo.get(app_id)
        if not app:
            return None

        health_scores = self.repo.get_health_history(app_id)
        if not health_scores:
            health_scores_data = [
                {"label": f"D-{28 - i}", "score": round(app.health_score + random.uniform(-5, 5), 1)}
                for i in range(28)
            ]
            health_scores_data.append({"label": "Today", "score": app.health_score})
        else:
            health_scores_data = [{"label": h.label, "score": h.score} for h in health_scores]

        base_latency = app.latency_p99
        base_rpm = app.rpm
        latency_24h = []
        throughput_24h = []
        error_rate_24h = []

        for i in range(48):
            t = i * 0.5
            l_val = (
                base_latency * (1 + 0.2 * math.sin(t * math.pi / 12))
                + random.uniform(-base_latency * 0.05, base_latency * 0.05)
            )
            latency_24h.append({
                "t": f"{int(t):02d}:{int((t % 1) * 60):02d}",
                "p50": round(l_val * 0.6, 1),
                "p95": round(l_val * 0.85, 1),
                "p99": round(l_val, 1),
            })
            rpm_val = base_rpm * (1 + 0.15 * math.sin(t * math.pi / 12)) + random.uniform(
                -base_rpm * 0.03, base_rpm * 0.03
            )
            throughput_24h.append({"t": f"{int(t):02d}:{int((t % 1) * 60):02d}", "rpm": round(rpm_val, 0)})
            base_err = 0.05 if app.status == "healthy" else (1.5 if app.status == "critical" else 0.3)
            err_val = base_err * (1 + 0.3 * math.sin(t * math.pi / 8)) + random.uniform(0, base_err * 0.2)
            error_rate_24h.append({"t": f"{int(t):02d}:{int((t % 1) * 60):02d}", "rate": round(err_val, 3)})

        return {
            "app": self._serialize_app(app),
            "health_history": health_scores_data,
            "latency_24h": latency_24h,
            "throughput_24h": throughput_24h,
            "error_rate_24h": error_rate_24h,
        }

    def create_app(self, data: Dict[str, Any]) -> Dict[str, Any]:
        app = Application(**data)
        created = self.repo.create(app)
        return self._serialize_app(created)

    def update_app(self, app_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        app = self.repo.get(app_id)
        if not app:
            return None
        updated = self.repo.update(app, data)
        return self._serialize_app(updated)

    def delete_app(self, app_id: str) -> bool:
        app = self.repo.get(app_id)
        if not app:
            return False
        return self.repo.delete(app)

    def get_health_summary(self) -> Dict[str, Any]:
        apps = self.repo.get_all()
        total = len(apps)
        if total == 0:
            return {"total": 0, "healthy": 0, "warning": 0, "critical": 0, "avg_score": 0.0}
        return {
            "total": total,
            "healthy": sum(1 for a in apps if a.status == "healthy"),
            "warning": sum(1 for a in apps if a.status == "warning"),
            "critical": sum(1 for a in apps if a.status == "critical"),
            "avg_score": round(sum(a.health_score for a in apps) / total, 1),
        }

    def _serialize_app(self, app: Application) -> Dict[str, Any]:
        return {
            "id": app.id,
            "name": app.name,
            "description": app.description,
            "team_id": app.team_id,
            "environment": app.environment,
            "status": app.status,
            "criticality": app.criticality,
            "health_score": app.health_score,
            "uptime": app.uptime,
            "latency_p99": app.latency_p99,
            "rpm": app.rpm,
            "app_type": app.app_type,
            "runtime": app.runtime,
            "version": app.version,
            "platform": app.platform,
            "tags": app.tags,
            "incident_count": app.incident_count,
            "dependency_count": app.dependency_count,
            "connector_count": app.connector_count,
            "trend": app.trend,
            "owner_name": app.owner_name,
        }
