from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base
from app.models.base import TimestampMixin


class Incident(Base, TimestampMixin):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(256))
    severity: Mapped[str] = mapped_column(String(32), default="warning")
    status: Mapped[str] = mapped_column(String(32), default="active")
    duration: Mapped[str] = mapped_column(String(64), default="")
    assignee: Mapped[str] = mapped_column(String(128), default="")
    ai_cause: Mapped[str] = mapped_column(Text, default="")
    health_impact: Mapped[str] = mapped_column(String(64), default="")
    affected_deps: Mapped[str] = mapped_column(JSON, default=list)
    timeline: Mapped[str] = mapped_column(JSON, default=list)
    started_at: Mapped[str] = mapped_column(String(64), default="")
    resolved_at: Mapped[str] = mapped_column(String(64), default="")
    app_name: Mapped[str] = mapped_column(String(128), default="")

    app: Mapped["Application"] = relationship("Application", back_populates="incidents")

    from app.models.apps import Application


class Alert(Base, TimestampMixin):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"), nullable=True)
    app_name: Mapped[str] = mapped_column(String(128), default="")
    rule_name: Mapped[str] = mapped_column(String(128))
    metric: Mapped[str] = mapped_column(String(64))
    value: Mapped[str] = mapped_column(String(64))
    threshold: Mapped[str] = mapped_column(String(64))
    severity: Mapped[str] = mapped_column(String(32), default="warning")
    status: Mapped[str] = mapped_column(String(32), default="firing")
    fired_at: Mapped[str] = mapped_column(String(64), default="")
    environment: Mapped[str] = mapped_column(String(64), default="Production")
