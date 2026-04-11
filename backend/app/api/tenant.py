from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.identity import Lob, OrgTeam, Project, User
from app.core.auth_deps import get_current_user

router = APIRouter(prefix="/api", tags=["tenant"])


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
