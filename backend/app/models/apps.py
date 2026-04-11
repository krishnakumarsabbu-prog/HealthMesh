from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.database.session import Base
from app.models.base import TimestampMixin


class Team(Base, TimestampMixin):
    __tablename__ = "teams"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    tier: Mapped[int] = mapped_column(Integer, default=2)
    health_score: Mapped[float] = mapped_column(Float, default=100.0)
    incident_count: Mapped[int] = mapped_column(Integer, default=0)
    lead_name: Mapped[str] = mapped_column(String(128), default="")
    slack_channel: Mapped[str] = mapped_column(String(128), default="")
    description: Mapped[str] = mapped_column(Text, default="")

    members: Mapped[list["TeamMember"]] = relationship("TeamMember", back_populates="team")
    applications: Mapped[list["Application"]] = relationship("Application", back_populates="team")


class TeamMember(Base, TimestampMixin):
    __tablename__ = "team_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    team_id: Mapped[str] = mapped_column(String(64), ForeignKey("teams.id"))
    name: Mapped[str] = mapped_column(String(128))
    initials: Mapped[str] = mapped_column(String(4))
    role: Mapped[str] = mapped_column(String(64))
    email: Mapped[str] = mapped_column(String(256))
    on_call: Mapped[bool] = mapped_column(Boolean, default=False)

    team: Mapped["Team"] = relationship("Team", back_populates="members")


class Environment(Base, TimestampMixin):
    __tablename__ = "environments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(64))
    health_score: Mapped[float] = mapped_column(Float, default=100.0)
    app_count: Mapped[int] = mapped_column(Integer, default=0)
    incident_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(32), default="healthy")


class Application(Base, TimestampMixin):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(Text, default="")
    team_id: Mapped[str] = mapped_column(String(64), ForeignKey("teams.id"))
    environment: Mapped[str] = mapped_column(String(64), default="Production")
    status: Mapped[str] = mapped_column(String(32), default="healthy")
    criticality: Mapped[str] = mapped_column(String(16), default="P1")
    health_score: Mapped[float] = mapped_column(Float, default=100.0)
    uptime: Mapped[float] = mapped_column(Float, default=99.9)
    latency_p99: Mapped[float] = mapped_column(Float, default=100.0)
    rpm: Mapped[float] = mapped_column(Float, default=1000.0)
    app_type: Mapped[str] = mapped_column(String(64), default="Service")
    runtime: Mapped[str] = mapped_column(String(64), default="")
    version: Mapped[str] = mapped_column(String(32), default="")
    platform: Mapped[str] = mapped_column(String(64), default="")
    tags: Mapped[str] = mapped_column(JSON, default=list)
    incident_count: Mapped[int] = mapped_column(Integer, default=0)
    dependency_count: Mapped[int] = mapped_column(Integer, default=0)
    connector_count: Mapped[int] = mapped_column(Integer, default=0)
    trend: Mapped[str] = mapped_column(JSON, default=list)
    owner_name: Mapped[str] = mapped_column(String(128), default="")
    project_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    team: Mapped["Team"] = relationship("Team", back_populates="applications")
    health_scores: Mapped[list["AppHealthScore"]] = relationship("AppHealthScore", back_populates="app")
    signals: Mapped[list["AppSignal"]] = relationship("AppSignal", back_populates="app")
    incidents: Mapped[list["Incident"]] = relationship("Incident", back_populates="app")
    health_rules: Mapped[list["AppHealthRule"]] = relationship("AppHealthRule", back_populates="app")
    ai_insights: Mapped[list["AiInsight"]] = relationship("AiInsight", back_populates="app")


class AppHealthScore(Base, TimestampMixin):
    __tablename__ = "app_health_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"))
    score: Mapped[float] = mapped_column(Float)
    label: Mapped[str] = mapped_column(String(32), default="")

    app: Mapped["Application"] = relationship("Application", back_populates="health_scores")


class AppSignal(Base, TimestampMixin):
    __tablename__ = "app_signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"))
    category: Mapped[str] = mapped_column(String(64))
    name: Mapped[str] = mapped_column(String(128))
    value: Mapped[str] = mapped_column(String(64))
    unit: Mapped[str] = mapped_column(String(32), default="")
    status: Mapped[str] = mapped_column(String(32), default="healthy")
    trend: Mapped[str] = mapped_column(String(16), default="stable")
    delta: Mapped[str] = mapped_column(String(32), default="")
    source: Mapped[str] = mapped_column(String(64), default="")

    app: Mapped["Application"] = relationship("Application", back_populates="signals")


class AppTransaction(Base, TimestampMixin):
    __tablename__ = "app_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"))
    endpoint: Mapped[str] = mapped_column(String(256))
    rpm: Mapped[float] = mapped_column(Float, default=0)
    latency_p99: Mapped[float] = mapped_column(Float, default=0)
    error_rate: Mapped[float] = mapped_column(Float, default=0)
    apdex: Mapped[float] = mapped_column(Float, default=1.0)
    status: Mapped[str] = mapped_column(String(32), default="healthy")


class AppLogPattern(Base, TimestampMixin):
    __tablename__ = "app_log_patterns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"))
    level: Mapped[str] = mapped_column(String(16))
    message: Mapped[str] = mapped_column(Text)
    count: Mapped[int] = mapped_column(Integer, default=1)
    first_seen: Mapped[str] = mapped_column(String(64), default="")
    last_seen: Mapped[str] = mapped_column(String(64), default="")


class AppInfraPod(Base, TimestampMixin):
    __tablename__ = "app_infra_pods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"))
    pod_name: Mapped[str] = mapped_column(String(128))
    node: Mapped[str] = mapped_column(String(64))
    cpu_pct: Mapped[float] = mapped_column(Float, default=0)
    mem_pct: Mapped[float] = mapped_column(Float, default=0)
    restarts: Mapped[int] = mapped_column(Integer, default=0)
    age: Mapped[str] = mapped_column(String(32), default="")
    status: Mapped[str] = mapped_column(String(32), default="Running")


class AppDependency(Base, TimestampMixin):
    __tablename__ = "app_dependencies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"))
    dep_name: Mapped[str] = mapped_column(String(128))
    dep_type: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(32), default="healthy")
    latency: Mapped[str] = mapped_column(String(32), default="")
    error_rate: Mapped[str] = mapped_column(String(32), default="")


class AppEndpoint(Base, TimestampMixin):
    __tablename__ = "app_endpoints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_id: Mapped[str] = mapped_column(String(64), ForeignKey("applications.id"))
    method: Mapped[str] = mapped_column(String(16))
    path: Mapped[str] = mapped_column(String(256))
    status: Mapped[str] = mapped_column(String(32), default="healthy")
    rpm: Mapped[float] = mapped_column(Float, default=0)
    latency_p99: Mapped[float] = mapped_column(Float, default=0)
    error_rate: Mapped[float] = mapped_column(Float, default=0)
    version: Mapped[str] = mapped_column(String(16), default="v1")
    auth: Mapped[str] = mapped_column(String(64), default="")
