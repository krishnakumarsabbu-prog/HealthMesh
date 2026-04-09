from sqlalchemy import String, Integer, Float, Boolean, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base
from app.models.base import TimestampMixin


class MaintenanceWindow(Base, TimestampMixin):
    __tablename__ = "maintenance_windows"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(256))
    description: Mapped[str] = mapped_column(Text, default="")
    start_time: Mapped[str] = mapped_column(String(64))
    end_time: Mapped[str] = mapped_column(String(64))
    affected_apps: Mapped[str] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(32), default="scheduled")
    created_by: Mapped[str] = mapped_column(String(128), default="")


class SLASetting(Base, TimestampMixin):
    __tablename__ = "sla_settings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    app_id: Mapped[str] = mapped_column(String(64), default="")
    name: Mapped[str] = mapped_column(String(128))
    target_pct: Mapped[float] = mapped_column(Float, default=99.9)
    current_pct: Mapped[float] = mapped_column(Float, default=99.9)
    error_budget_remaining: Mapped[float] = mapped_column(Float, default=100.0)
    period: Mapped[str] = mapped_column(String(32), default="30d")
    status: Mapped[str] = mapped_column(String(32), default="healthy")


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_name: Mapped[str] = mapped_column(String(128), default="System")
    user_email: Mapped[str] = mapped_column(String(256), default="")
    action: Mapped[str] = mapped_column(String(64))
    resource_type: Mapped[str] = mapped_column(String(64))
    resource_id: Mapped[str] = mapped_column(String(128), default="")
    resource_name: Mapped[str] = mapped_column(String(256), default="")
    details: Mapped[str] = mapped_column(Text, default="")
    ip_address: Mapped[str] = mapped_column(String(64), default="")
    timestamp: Mapped[str] = mapped_column(String(64), default="")


class AppSettings(Base, TimestampMixin):
    __tablename__ = "app_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String(128), unique=True)
    value: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(64), default="general")
    description: Mapped[str] = mapped_column(Text, default="")
