import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.identity import User, OrgTeam, Project, Lob
from app.core.auth_deps import get_current_user, require_role, ROLE_HIERARCHY
from app.core.audit import write_audit_log
from app.schemas.identity import ProjectCreate, ProjectUpdate, ProjectOut

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _serialize_project(project: Project) -> dict:
    team = project.org_team
    return {
        "id": project.id,
        "name": project.name,
        "team_id": project.team_id,
        "team_name": team.name if team else None,
        "lob_id": team.lob_id if team else None,
        "lob_name": team.lob.name if (team and team.lob) else None,
    }


def _assert_team_in_scope(caller: User, team: OrgTeam) -> None:
    if caller.role_id == "TEAM_ADMIN":
        if team.id != caller.team_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Team Admin can only create projects within their own team",
            )

    elif caller.role_id == "LOB_ADMIN" and caller.lob_id:
        if team.lob_id != caller.lob_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="LOB Admin can only create projects within their LOB",
            )


@router.get("", response_model=List[dict])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Project)

    if current_user.role_id == "LOB_ADMIN" and current_user.lob_id:
        lob_team_ids = [t.id for t in db.query(OrgTeam).filter(OrgTeam.lob_id == current_user.lob_id).all()]
        query = query.filter(Project.team_id.in_(lob_team_ids))
    elif current_user.role_id == "TEAM_ADMIN":
        query = query.filter(Project.team_id == current_user.team_id)
    elif current_user.role_id in ("PROJECT_ADMIN", "USER"):
        query = query.filter(Project.id == current_user.project_id)

    projects = query.all()
    return [_serialize_project(p) for p in projects]


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("TEAM_ADMIN")),
):
    team = db.query(OrgTeam).filter(OrgTeam.id == payload.team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team_id")

    _assert_team_in_scope(current_user, team)

    project_id = str(uuid.uuid4())
    new_project = Project(
        id=project_id,
        name=payload.name,
        team_id=payload.team_id,
    )
    db.add(new_project)
    db.flush()

    write_audit_log(
        db=db,
        actor=current_user,
        action="CREATE",
        resource_type="Project",
        resource_id=project_id,
        resource_name=payload.name,
        details=f"Created project '{payload.name}' in team {team.name}",
        ip_address=request.client.host if request.client else "",
    )

    db.commit()
    db.refresh(new_project)
    return _serialize_project(new_project)


@router.put("/{project_id}", response_model=dict)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("TEAM_ADMIN")),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    _assert_team_in_scope(current_user, project.org_team)

    if payload.team_id is not None and payload.team_id != project.team_id:
        new_team = db.query(OrgTeam).filter(OrgTeam.id == payload.team_id).first()
        if not new_team:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team_id")
        _assert_team_in_scope(current_user, new_team)
        project.team_id = payload.team_id

    if payload.name is not None:
        project.name = payload.name

    write_audit_log(
        db=db,
        actor=current_user,
        action="UPDATE",
        resource_type="Project",
        resource_id=project.id,
        resource_name=project.name,
        details=f"Updated project '{project.name}'",
        ip_address=request.client.host if request.client else "",
    )

    db.commit()
    db.refresh(project)
    return _serialize_project(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("LOB_ADMIN")),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    _assert_team_in_scope(current_user, project.org_team)

    project_name = project.name
    write_audit_log(
        db=db,
        actor=current_user,
        action="DELETE",
        resource_type="Project",
        resource_id=project_id,
        resource_name=project_name,
        details=f"Deleted project '{project_name}'",
        ip_address=request.client.host if request.client else "",
    )

    db.delete(project)
    db.commit()
