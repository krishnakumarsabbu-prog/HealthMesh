from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import ConnectorTemplate, ConnectorInstance
from app.repositories.base import BaseRepository


class ConnectorTemplateRepository(BaseRepository[ConnectorTemplate]):
    def __init__(self, db: Session):
        super().__init__(ConnectorTemplate, db)

    def get_popular(self) -> List[ConnectorTemplate]:
        return self.db.query(ConnectorTemplate).filter(ConnectorTemplate.popular == True).all()

    def get_by_category(self, category: str) -> List[ConnectorTemplate]:
        return self.db.query(ConnectorTemplate).filter(ConnectorTemplate.category == category).all()


class ConnectorInstanceRepository(BaseRepository[ConnectorInstance]):
    def __init__(self, db: Session):
        super().__init__(ConnectorInstance, db)

    def get_by_status(self, status: str) -> List[ConnectorInstance]:
        return self.db.query(ConnectorInstance).filter(ConnectorInstance.status == status).all()

    def get_by_environment(self, environment: str) -> List[ConnectorInstance]:
        return self.db.query(ConnectorInstance).filter(ConnectorInstance.environment == environment).all()

    def get_healthy_count(self) -> int:
        return self.db.query(ConnectorInstance).filter(ConnectorInstance.status == "healthy").count()
