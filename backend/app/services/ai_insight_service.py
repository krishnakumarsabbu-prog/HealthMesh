from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories import AiInsightRepository


class AiInsightService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AiInsightRepository(db)

    def list_insights(self, priority: Optional[str] = None, insight_type: Optional[str] = None) -> List[Dict[str, Any]]:
        if priority:
            insights = self.repo.get_by_priority(priority)
        elif insight_type:
            insights = self.repo.get_by_type(insight_type)
        else:
            insights = self.repo.get_all()
        return [self._serialize(i) for i in insights]

    def get_insights_by_app(self, app_id: str) -> List[Dict[str, Any]]:
        insights = self.repo.get_by_app(app_id)
        return [self._serialize(i) for i in insights]

    def get_recent_highlights(self, limit: int = 3) -> List[Dict[str, Any]]:
        insights = self.repo.get_recent(limit)
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

    def generate_stub_summary(self, app_id: str, app_status: str) -> Dict[str, Any]:
        status_map = {
            "healthy": "Application is operating within all defined SLOs. No anomalies detected in the last 24 hours.",
            "warning": "Application shows signs of degradation. One or more metrics are trending outside normal bounds.",
            "critical": "Application is experiencing significant degradation. Immediate investigation recommended.",
        }
        return {
            "app_id": app_id,
            "summary": status_map.get(app_status, "Status unknown."),
            "generated_at": "just now",
            "confidence": 0.85,
            "source": "AI Stub Engine",
        }

    def _serialize(self, i) -> Dict[str, Any]:
        return {
            "id": i.id,
            "app_id": i.app_id,
            "app_name": i.app_name,
            "insight_type": i.insight_type,
            "priority": i.priority,
            "title": i.title,
            "description": i.description,
            "confidence": i.confidence,
            "impact": i.impact,
            "recommendation": i.recommendation,
            "signals": i.signals,
            "what_changed": i.what_changed,
            "generated_at": i.generated_at,
        }
