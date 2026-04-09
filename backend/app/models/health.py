from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base
from app.models.base import TimestampMixin


class HealthRule(Base, TimestampMixin):
    __tablename__ = "health_rules"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    metric: Mapped[str] = mapped_column(String(64))
    operator: Mapped[str] = mapped_column(String(16))
    threshold: Mapped[float] = mapped_column(Float)
    severity: Mapped[str] = mapped_column(String(32), default="warning")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    scope: Mapped[str] = mapped_column(String(64), default="all")
    trigger_count: Mapped[int] = mapped_column(Integer, default=0)
    tags: Mapped[str] = mapped_column(JSON, default=list)
    version: Mapped[int] = mapped_column(Integer, default=1)
    last_triggered: Mapped[str] = mapped_column(String(64), default="")
    description: Mapped[str] = mapped_column(Text, default="")

    app_rules: Mapped[list["AppHealthRule"]] = relationship("AppHealthRule", back_populates="rule")


class AppHealthRule(Base, TimestampMixin):
    __tablename__ = "app_health_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"))
    rule_id: Mapped[str] = mapped_column(String(64), ForeignKey("health_rules.id"))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    custom_threshold: Mapped[float] = mapped_column(Float, default=0)

    rule: Mapped["HealthRule"] = relationship("HealthRule", back_populates="app_rules")
    app: Mapped["Application"] = relationship("Application", back_populates="health_rules")

    from app.models.apps import Application
