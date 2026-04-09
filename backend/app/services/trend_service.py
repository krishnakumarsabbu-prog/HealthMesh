from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.repositories import TrendDataPointRepository


class TrendService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TrendDataPointRepository(db)

    def get_health_trends(self, period: str = "monthly") -> List[Dict[str, Any]]:
        data = self.repo.get_by_period(period)
        return [
            {
                "label": d.label,
                "health_score": d.health_score,
                "availability": d.availability,
                "incidents": d.incidents,
                "latency": d.latency,
                "error_rate": d.error_rate,
                "mttr": d.mttr,
                "mttd": d.mttd,
            }
            for d in data
        ]

    def get_incident_trends(self, period: str = "monthly") -> List[Dict[str, Any]]:
        data = self.repo.get_by_period(period)
        return [{"label": d.label, "incidents": d.incidents, "mttr": d.mttr, "mttd": d.mttd} for d in data]

    def get_latency_trends(self, period: str = "monthly") -> List[Dict[str, Any]]:
        data = self.repo.get_by_period(period)
        return [{"label": d.label, "latency": d.latency, "health_score": d.health_score} for d in data]

    def get_error_trends(self, period: str = "monthly") -> List[Dict[str, Any]]:
        data = self.repo.get_by_period(period)
        return [{"label": d.label, "error_rate": d.error_rate, "availability": d.availability} for d in data]
