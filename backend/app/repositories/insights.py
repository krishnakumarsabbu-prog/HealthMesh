from typing import List
from sqlalchemy.orm import Session
from app.models import AiInsight, DashboardSnapshot, TrendDataPoint
from app.repositories.base import BaseRepository


class AiInsightRepository(BaseRepository[AiInsight]):
    def __init__(self, db: Session):
        super().__init__(AiInsight, db)

    def get_by_app(self, app_id: str) -> List[AiInsight]:
        return self.db.query(AiInsight).filter(AiInsight.app_id == app_id).all()

    def get_by_priority(self, priority: str) -> List[AiInsight]:
        return self.db.query(AiInsight).filter(AiInsight.priority == priority).all()

    def get_by_type(self, insight_type: str) -> List[AiInsight]:
        return self.db.query(AiInsight).filter(AiInsight.insight_type == insight_type).all()

    def get_recent(self, limit: int = 5) -> List[AiInsight]:
        return self.db.query(AiInsight).order_by(AiInsight.id.desc()).limit(limit).all()


class DashboardSnapshotRepository(BaseRepository[DashboardSnapshot]):
    def __init__(self, db: Session):
        super().__init__(DashboardSnapshot, db)

    def get_last_24h(self) -> List[DashboardSnapshot]:
        return self.db.query(DashboardSnapshot).order_by(DashboardSnapshot.id.asc()).limit(24).all()


class TrendDataPointRepository(BaseRepository[TrendDataPoint]):
    def __init__(self, db: Session):
        super().__init__(TrendDataPoint, db)

    def get_by_period(self, period_type: str) -> List[TrendDataPoint]:
        return (
            self.db.query(TrendDataPoint)
            .filter(TrendDataPoint.period_type == period_type)
            .order_by(TrendDataPoint.id.asc())
            .all()
        )
