from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import MaintenanceWindow, SLASetting, AuditLog, AppSettings
from app.repositories.base import BaseRepository


class MaintenanceWindowRepository(BaseRepository[MaintenanceWindow]):
    def __init__(self, db: Session):
        super().__init__(MaintenanceWindow, db)

    def get_active(self) -> List[MaintenanceWindow]:
        return self.db.query(MaintenanceWindow).filter(MaintenanceWindow.status == "active").all()

    def get_scheduled(self) -> List[MaintenanceWindow]:
        return self.db.query(MaintenanceWindow).filter(MaintenanceWindow.status == "scheduled").all()


class SLASettingRepository(BaseRepository[SLASetting]):
    def __init__(self, db: Session):
        super().__init__(SLASetting, db)

    def get_by_app(self, app_id: str) -> Optional[SLASetting]:
        return self.db.query(SLASetting).filter(SLASetting.app_id == app_id).first()

    def get_at_risk(self) -> List[SLASetting]:
        return self.db.query(SLASetting).filter(SLASetting.status != "healthy").all()


class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self, db: Session):
        super().__init__(AuditLog, db)

    def get_recent(self, limit: int = 50) -> List[AuditLog]:
        return self.db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()

    def get_by_user(self, user_email: str) -> List[AuditLog]:
        return self.db.query(AuditLog).filter(AuditLog.user_email == user_email).all()

    def get_by_resource(self, resource_type: str) -> List[AuditLog]:
        return self.db.query(AuditLog).filter(AuditLog.resource_type == resource_type).all()


class AppSettingsRepository(BaseRepository[AppSettings]):
    def __init__(self, db: Session):
        super().__init__(AppSettings, db)

    def get_by_key(self, key: str) -> Optional[AppSettings]:
        return self.db.query(AppSettings).filter(AppSettings.key == key).first()

    def get_by_category(self, category: str) -> List[AppSettings]:
        return self.db.query(AppSettings).filter(AppSettings.category == category).all()

    def get_as_dict(self) -> dict:
        all_settings = self.db.query(AppSettings).all()
        return {s.key: s.value for s in all_settings}
