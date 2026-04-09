from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base
from app.models.base import TimestampMixin


class AiInsight(Base, TimestampMixin):
    __tablename__ = "ai_insights"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"), nullable=True)
    app_name: Mapped[str] = mapped_column(String(128), default="")
    insight_type: Mapped[str] = mapped_column(String(64))
    priority: Mapped[str] = mapped_column(String(32), default="medium")
    title: Mapped[str] = mapped_column(String(256))
    description: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float, default=0.8)
    impact: Mapped[str] = mapped_column(String(128), default="")
    recommendation: Mapped[str] = mapped_column(Text, default="")
    signals: Mapped[str] = mapped_column(JSON, default=list)
    what_changed: Mapped[str] = mapped_column(Text, default="")
    generated_at: Mapped[str] = mapped_column(String(64), default="")

    app: Mapped["Application"] = relationship("Application", back_populates="ai_insights")

    from app.models.apps import Application


class DashboardSnapshot(Base, TimestampMixin):
    __tablename__ = "dashboard_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hour_label: Mapped[str] = mapped_column(String(16), default="")
    health_score: Mapped[float] = mapped_column(Float, default=100.0)
    incidents: Mapped[int] = mapped_column(Integer, default=0)
    alerts: Mapped[int] = mapped_column(Integer, default=0)
    healthy_apps: Mapped[int] = mapped_column(Integer, default=0)
    degraded_apps: Mapped[int] = mapped_column(Integer, default=0)
    critical_apps: Mapped[int] = mapped_column(Integer, default=0)


class TrendDataPoint(Base, TimestampMixin):
    __tablename__ = "trend_data_points"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    period_type: Mapped[str] = mapped_column(String(16), default="daily")
    label: Mapped[str] = mapped_column(String(32))
    health_score: Mapped[float] = mapped_column(Float, default=100.0)
    availability: Mapped[float] = mapped_column(Float, default=99.9)
    incidents: Mapped[int] = mapped_column(Integer, default=0)
    latency: Mapped[float] = mapped_column(Float, default=100.0)
    error_rate: Mapped[float] = mapped_column(Float, default=0.0)
    mttr: Mapped[float] = mapped_column(Float, default=0.0)
    mttd: Mapped[float] = mapped_column(Float, default=0.0)
