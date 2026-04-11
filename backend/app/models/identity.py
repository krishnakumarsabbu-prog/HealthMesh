from sqlalchemy import String, Integer, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base
from app.models.base import TimestampMixin


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(64), unique=True)
    description: Mapped[str] = mapped_column(Text, default="")

    users: Mapped[list["User"]] = relationship("User", back_populates="role")


class Lob(Base, TimestampMixin):
    __tablename__ = "lobs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), unique=True)
    description: Mapped[str] = mapped_column(Text, default="")

    org_teams: Mapped[list["OrgTeam"]] = relationship("OrgTeam", back_populates="lob")
    users: Mapped[list["User"]] = relationship("User", back_populates="lob")


class OrgTeam(Base, TimestampMixin):
    __tablename__ = "org_teams"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    lob_id: Mapped[str] = mapped_column(String(64), ForeignKey("lobs.id"))

    lob: Mapped["Lob"] = relationship("Lob", back_populates="org_teams")
    projects: Mapped[list["Project"]] = relationship("Project", back_populates="org_team")
    users: Mapped[list["User"]] = relationship("User", back_populates="org_team")


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    team_id: Mapped[str] = mapped_column(String(64), ForeignKey("org_teams.id"))

    org_team: Mapped["OrgTeam"] = relationship("OrgTeam", back_populates="projects")
    users: Mapped[list["User"]] = relationship("User", back_populates="project")


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128))
    email: Mapped[str] = mapped_column(String(256), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    role_id: Mapped[str] = mapped_column(String(64), ForeignKey("roles.id"))
    lob_id: Mapped[str] = mapped_column(String(64), ForeignKey("lobs.id"), nullable=True)
    team_id: Mapped[str] = mapped_column(String(64), ForeignKey("org_teams.id"), nullable=True)
    project_id: Mapped[str] = mapped_column(String(64), ForeignKey("projects.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    role: Mapped["Role"] = relationship("Role", back_populates="users")
    lob: Mapped["Lob"] = relationship("Lob", back_populates="users")
    org_team: Mapped["OrgTeam"] = relationship("OrgTeam", back_populates="users")
    project: Mapped["Project"] = relationship("Project", back_populates="users")
