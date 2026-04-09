from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base
from app.models.base import TimestampMixin


class DependencyNode(Base, TimestampMixin):
    __tablename__ = "dependency_nodes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    label: Mapped[str] = mapped_column(String(128))
    node_type: Mapped[str] = mapped_column(String(32), default="service")
    status: Mapped[str] = mapped_column(String(32), default="healthy")
    latency: Mapped[str] = mapped_column(String(32), default="")
    error_rate: Mapped[str] = mapped_column(String(32), default="")
    rps: Mapped[str] = mapped_column(String(32), default="")
    uptime: Mapped[str] = mapped_column(String(32), default="")
    version: Mapped[str] = mapped_column(String(32), default="")
    team: Mapped[str] = mapped_column(String(64), default="")
    x: Mapped[float] = mapped_column(Float, default=0)
    y: Mapped[float] = mapped_column(Float, default=0)


class DependencyEdge(Base, TimestampMixin):
    __tablename__ = "dependency_edges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source_id: Mapped[str] = mapped_column(String(64), ForeignKey("dependency_nodes.id"))
    target_id: Mapped[str] = mapped_column(String(64), ForeignKey("dependency_nodes.id"))
    status: Mapped[str] = mapped_column(String(32), default="healthy")
    latency: Mapped[str] = mapped_column(String(32), default="")
    label: Mapped[str] = mapped_column(String(64), default="")
