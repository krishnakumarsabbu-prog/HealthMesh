from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import (
    Application, AppHealthScore, AppSignal, AppTransaction,
    AppLogPattern, AppInfraPod, AppDependency, AppEndpoint
)
from app.repositories.base import BaseRepository


class ApplicationRepository(BaseRepository[Application]):
    def __init__(self, db: Session):
        super().__init__(Application, db)

    def get_by_status(self, status: str) -> List[Application]:
        return self.db.query(Application).filter(Application.status == status).all()

    def get_by_team(self, team_id: str) -> List[Application]:
        return self.db.query(Application).filter(Application.team_id == team_id).all()

    def get_by_criticality(self, criticality: str) -> List[Application]:
        return self.db.query(Application).filter(Application.criticality == criticality).all()

    def get_impacted(self, statuses: List[str] = None) -> List[Application]:
        if statuses is None:
            statuses = ["critical", "warning"]
        return (
            self.db.query(Application)
            .filter(Application.status.in_(statuses))
            .order_by(Application.health_score.asc())
            .all()
        )

    def get_health_history(self, app_id: str) -> List[AppHealthScore]:
        return (
            self.db.query(AppHealthScore)
            .filter(AppHealthScore.app_id == app_id)
            .all()
        )

    def get_signals(self, app_id: str) -> List[AppSignal]:
        return self.db.query(AppSignal).filter(AppSignal.app_id == app_id).all()

    def get_transactions(self, app_id: str) -> List[AppTransaction]:
        return self.db.query(AppTransaction).filter(AppTransaction.app_id == app_id).all()

    def get_log_patterns(self, app_id: str) -> List[AppLogPattern]:
        return self.db.query(AppLogPattern).filter(AppLogPattern.app_id == app_id).all()

    def get_infra_pods(self, app_id: str) -> List[AppInfraPod]:
        return self.db.query(AppInfraPod).filter(AppInfraPod.app_id == app_id).all()

    def get_dependencies(self, app_id: str) -> List[AppDependency]:
        return self.db.query(AppDependency).filter(AppDependency.app_id == app_id).all()

    def get_endpoints(self, app_id: str) -> List[AppEndpoint]:
        return self.db.query(AppEndpoint).filter(AppEndpoint.app_id == app_id).all()
