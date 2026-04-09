from typing import List
from sqlalchemy.orm import Session
from app.models import HealthRule, AppHealthRule
from app.repositories.base import BaseRepository


class HealthRuleRepository(BaseRepository[HealthRule]):
    def __init__(self, db: Session):
        super().__init__(HealthRule, db)

    def get_enabled(self) -> List[HealthRule]:
        return self.db.query(HealthRule).filter(HealthRule.enabled == True).all()

    def get_by_severity(self, severity: str) -> List[HealthRule]:
        return self.db.query(HealthRule).filter(HealthRule.severity == severity).all()

    def get_by_metric(self, metric: str) -> List[HealthRule]:
        return self.db.query(HealthRule).filter(HealthRule.metric == metric).all()


class AppHealthRuleRepository(BaseRepository[AppHealthRule]):
    def __init__(self, db: Session):
        super().__init__(AppHealthRule, db)

    def get_by_app(self, app_id: str) -> List[AppHealthRule]:
        return self.db.query(AppHealthRule).filter(AppHealthRule.app_id == app_id).all()
