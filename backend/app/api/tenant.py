import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.identity import Lob, OrgTeam, Project, User
from app.models.apps import Application
from app.core.auth_deps import get_current_user, require_role
from app.core.audit import write_audit_log

router = APIRouter(prefix="/api", tags=["tenant"])


class OrgTeamCreate(BaseModel):
    name: str
    lob_id: str
    description: Optional[str] = None


@router.get("/lobs")
def list_lobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role_id == "LOB_ADMIN":
        lobs = db.query(Lob).filter(Lob.id == current_user.lob_id).all()
    else:
        lobs = db.query(Lob).all()
    return [{"id": l.id, "name": l.name, "description": l.description} for l in lobs]


@router.get("/teams")
def list_teams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(OrgTeam)
    if current_user.role_id == "LOB_ADMIN":
        query = query.filter(OrgTeam.lob_id == current_user.lob_id)
    elif current_user.role_id in ("TEAM_ADMIN", "PROJECT_ADMIN", "USER"):
        query = query.filter(OrgTeam.id == current_user.team_id)
    teams = query.all()
    return [{"id": t.id, "name": t.name, "lob_id": t.lob_id} for t in teams]


@router.post("/teams", status_code=status.HTTP_201_CREATED)
def create_team(
    payload: OrgTeamCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("LOB_ADMIN")),
):
    lob = db.query(Lob).filter(Lob.id == payload.lob_id).first()
    if not lob:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lob_id")

    if current_user.role_id == "LOB_ADMIN" and current_user.lob_id and current_user.lob_id != payload.lob_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create a team outside your LOB")

    team_id = str(uuid.uuid4())
    new_team = OrgTeam(id=team_id, name=payload.name, lob_id=payload.lob_id)
    db.add(new_team)
    db.flush()

    write_audit_log(
        db=db,
        actor=current_user,
        action="CREATE",
        resource_type="OrgTeam",
        resource_id=team_id,
        resource_name=payload.name,
        details=f"Created team '{payload.name}' in LOB {lob.name}",
        ip_address=request.client.host if request.client else "",
    )

    db.commit()
    db.refresh(new_team)
    return {"id": new_team.id, "name": new_team.name, "lob_id": new_team.lob_id}


@router.get("/projects")
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Project)
    if current_user.role_id == "LOB_ADMIN":
        lob_team_ids = [t.id for t in db.query(OrgTeam).filter(OrgTeam.lob_id == current_user.lob_id).all()]
        query = query.filter(Project.team_id.in_(lob_team_ids))
    elif current_user.role_id == "TEAM_ADMIN":
        query = query.filter(Project.team_id == current_user.team_id)
    elif current_user.role_id in ("PROJECT_ADMIN", "USER"):
        query = query.filter(Project.id == current_user.project_id)
    projects = query.all()
    return [{"id": p.id, "name": p.name, "team_id": p.team_id} for p in projects]


@router.get("/lobs/{lob_id}/teams")
def list_teams_by_lob(
    lob_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lob = db.query(Lob).filter(Lob.id == lob_id).first()
    if not lob:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="LOB not found")

    if current_user.role_id == "LOB_ADMIN" and current_user.lob_id and current_user.lob_id != lob_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to this LOB is not permitted")

    teams = db.query(OrgTeam).filter(OrgTeam.lob_id == lob_id).all()
    return [{"id": t.id, "name": t.name, "lob_id": t.lob_id} for t in teams]


@router.get("/teams/{team_id}/projects")
def list_projects_by_team(
    team_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.query(OrgTeam).filter(OrgTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    if current_user.role_id == "LOB_ADMIN" and current_user.lob_id:
        if team.lob_id != current_user.lob_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Team is outside your LOB scope")

    elif current_user.role_id == "TEAM_ADMIN":
        if team.id != current_user.team_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to this team is not permitted")

    elif current_user.role_id in ("PROJECT_ADMIN", "USER"):
        if team.id != current_user.team_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to this team is not permitted")

    projects = db.query(Project).filter(Project.team_id == team_id).all()
    return [{"id": p.id, "name": p.name, "team_id": p.team_id} for p in projects]


@router.get("/projects/{project_id}/apps")
def list_apps_by_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    team = project.org_team

    if current_user.role_id == "LOB_ADMIN" and current_user.lob_id:
        if not team or team.lob_id != current_user.lob_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Project is outside your LOB scope")

    elif current_user.role_id == "TEAM_ADMIN":
        if not team or team.id != current_user.team_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Project is outside your team scope")

    elif current_user.role_id in ("PROJECT_ADMIN", "USER"):
        if project.id != current_user.project_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to this project is not permitted")

    apps = db.query(Application).filter(Application.project_id == project_id).all()
    return [
        {
            "id": a.id,
            "name": a.name,
            "status": a.status,
            "health_score": a.health_score,
            "criticality": a.criticality,
            "project_id": a.project_id,
        }
        for a in apps
    ]
