from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from datetime import datetime
from app.database.session import Base
from app.models.base import TimestampMixin


class ConnectorTemplate(Base, TimestampMixin):
    __tablename__ = "connector_templates"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    category: Mapped[str] = mapped_column(String(64))
    description: Mapped[str] = mapped_column(Text, default="")
    logo: Mapped[str] = mapped_column(String(256), default="")
    color: Mapped[str] = mapped_column(String(32), default="")
    version: Mapped[str] = mapped_column(String(32), default="")
    fields: Mapped[str] = mapped_column(JSON, default=list)
    capabilities: Mapped[str] = mapped_column(JSON, default=list)
    popular: Mapped[bool] = mapped_column(Boolean, default=False)

    instances: Mapped[list["ConnectorInstance"]] = relationship("ConnectorInstance", back_populates="template")


class ConnectorInstance(Base, TimestampMixin):
    __tablename__ = "connector_instances"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    template_id: Mapped[str] = mapped_column(String(64), ForeignKey("connector_templates.id"))
    name: Mapped[str] = mapped_column(String(128))
    category: Mapped[str] = mapped_column(String(64))
    environment: Mapped[str] = mapped_column(String(64), default="Production")
    status: Mapped[str] = mapped_column(String(32), default="healthy")
    health_pct: Mapped[float] = mapped_column(Float, default=100.0)
    app_count: Mapped[int] = mapped_column(Integer, default=0)
    version: Mapped[str] = mapped_column(String(32), default="")
    last_sync: Mapped[str] = mapped_column(String(64), default="")
    metrics_count: Mapped[str] = mapped_column(String(32), default="0")
    config: Mapped[str] = mapped_column(JSON, default=dict)
    lob_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    managed_by: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)

    template: Mapped["ConnectorTemplate"] = relationship("ConnectorTemplate", back_populates="instances")
    app_assignments: Mapped[list["AppConnectorAssignment"]] = relationship("AppConnectorAssignment", back_populates="connector_instance")


class AppConnectorAssignment(Base, TimestampMixin):
    __tablename__ = "app_connector_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"))
    connector_instance_id: Mapped[str] = mapped_column(String(64), ForeignKey("connector_instances.id"))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    poll_interval_seconds: Mapped[int] = mapped_column(Integer, default=60)
    assigned_by: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)

    connector_instance: Mapped["ConnectorInstance"] = relationship("ConnectorInstance", back_populates="app_assignments")


class AppHealthPollResult(Base):
    __tablename__ = "app_health_poll_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"))
    connector_instance_id: Mapped[str] = mapped_column(String(64), ForeignKey("connector_instances.id"))
    connector_name: Mapped[str] = mapped_column(String(128), default="")
    connector_category: Mapped[str] = mapped_column(String(64), default="")
    status: Mapped[str] = mapped_column(String(32), default="ok")
    health_score: Mapped[float] = mapped_column(Float, default=100.0)
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)
    raw_response: Mapped[dict] = mapped_column(JSON, default=dict)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    polled_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
