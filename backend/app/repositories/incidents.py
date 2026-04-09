from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Incident, Alert
from app.repositories.base import BaseRepository


class IncidentRepository(BaseRepository[Incident]):
    def __init__(self, db: Session):
        super().__init__(Incident, db)

    def get_active(self) -> List[Incident]:
        return (
            self.db.query(Incident)
            .filter(Incident.status == "active")
            .order_by(Incident.id.desc())
            .all()
        )

    def get_by_app(self, app_id: str) -> List[Incident]:
        return self.db.query(Incident).filter(Incident.app_id == app_id).all()

    def get_by_severity(self, severity: str) -> List[Incident]:
        return self.db.query(Incident).filter(Incident.severity == severity).all()

    def count_active(self) -> int:
        return self.db.query(Incident).filter(Incident.status == "active").count()


class AlertRepository(BaseRepository[Alert]):
    def __init__(self, db: Session):
        super().__init__(Alert, db)

    def get_firing(self) -> List[Alert]:
        return self.db.query(Alert).filter(Alert.status == "firing").all()

    def get_by_app(self, app_id: str) -> List[Alert]:
        return self.db.query(Alert).filter(Alert.app_id == app_id).all()

    def count_firing(self) -> int:
        return self.db.query(Alert).filter(Alert.status == "firing").count()
