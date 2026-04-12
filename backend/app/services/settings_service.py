from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories import (
    MaintenanceWindowRepository, SLASettingRepository,
    AuditLogRepository, AppSettingsRepository
)
from app.models import MaintenanceWindow, AuditLog


class SettingsService:
    def __init__(self, db: Session):
        self.db = db
        self.mw_repo = MaintenanceWindowRepository(db)
        self.sla_repo = SLASettingRepository(db)
        self.audit_repo = AuditLogRepository(db)
        self.settings_repo = AppSettingsRepository(db)

    def list_maintenance_windows(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if status == "active":
            windows = self.mw_repo.get_active()
        elif status == "scheduled":
            windows = self.mw_repo.get_scheduled()
        else:
            windows = self.mw_repo.get_all()
        return [self._serialize_mw(w) for w in windows]

    def create_maintenance_window(self, data: Dict[str, Any]) -> Dict[str, Any]:
        count = self.mw_repo.count()
        window = MaintenanceWindow(
            id=data.get("id", f"mw-{count + 10:03d}"),
            title=data["title"],
            description=data.get("description", ""),
            start_time=data["start_time"],
            end_time=data["end_time"],
            affected_apps=data.get("affected_apps", []),
            status="scheduled",
            created_by=data.get("created_by", "System"),
        )
        created = self.mw_repo.create(window)
        return self._serialize_mw(created)

    def list_sla_settings(self) -> List[Dict[str, Any]]:
        slas = self.sla_repo.get_all()
        return [
            {
                "id": s.id,
                "app_id": s.app_id,
                "name": s.name,
                "target_pct": s.target_pct,
                "current_pct": s.current_pct,
                "error_budget_remaining": s.error_budget_remaining,
                "period": s.period,
                "status": s.status,
            }
            for s in slas
        ]

    def list_audit_logs(self, limit: int = 50, lob_id: Optional[str] = None) -> List[Dict[str, Any]]:
        logs = self.audit_repo.get_recent(limit)
        if lob_id:
            logs = [l for l in logs if l.lob_id == lob_id or l.lob_id is None]
        return [
            {
                "id": l.id,
                "user_name": l.user_name,
                "user_email": l.user_email,
                "action": l.action,
                "resource_type": l.resource_type,
                "resource_id": l.resource_id,
                "resource_name": l.resource_name,
                "details": l.details,
                "ip_address": l.ip_address,
                "timestamp": l.timestamp,
                "lob_id": l.lob_id,
                "team_id": l.team_id,
            }
            for l in logs
        ]

    def record_audit_log(self, data: Dict[str, Any]) -> Dict[str, Any]:
        log = AuditLog(**data)
        created = self.audit_repo.create(log)
        return {"id": created.id}

    def get_settings(self) -> Dict[str, str]:
        return self.settings_repo.get_as_dict()

    def update_setting(self, key: str, value: str) -> Dict[str, Any]:
        setting = self.settings_repo.get_by_key(key)
        if setting:
            self.settings_repo.update(setting, {"value": value})
            return {"key": key, "value": value, "updated": True}
        return {"key": key, "updated": False, "error": "Setting not found"}

    def _serialize_mw(self, w: MaintenanceWindow) -> Dict[str, Any]:
        return {
            "id": w.id,
            "title": w.title,
            "description": w.description,
            "start_time": w.start_time,
            "end_time": w.end_time,
            "affected_apps": w.affected_apps,
            "status": w.status,
            "created_by": w.created_by,
        }
