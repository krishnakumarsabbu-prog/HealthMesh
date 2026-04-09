from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
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

    template: Mapped["ConnectorTemplate"] = relationship("ConnectorTemplate", back_populates="instances")
