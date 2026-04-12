from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.identity import User, OrgTeam, Project, Lob, Role
from app.core.auth_deps import get_current_user, require_role, ROLE_HIERARCHY
from app.core.security import get_password_hash
from app.core.audit import write_audit_log
from app.schemas.identity import UserCreate, UserUpdate, UserOut

router = APIRouter(prefix="/api/users", tags=["users"])


def _serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role_id": user.role_id,
        "role_name": user.role.name if user.role else None,
        "lob_id": user.lob_id,
        "lob_name": user.lob.name if user.lob else None,
        "team_id": user.team_id,
        "team_name": user.org_team.name if user.org_team else None,
        "project_id": user.project_id,
        "project_name": user.project.name if user.project else None,
        "is_active": user.is_active,
    }


def _assert_scope(caller: User, role_id: str, lob_id: Optional[str], team_id: Optional[str]) -> None:
    caller_level = ROLE_HIERARCHY.get(caller.role_id, 0)
    target_level = ROLE_HIERARCHY.get(role_id, 0)

    if target_level >= caller_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot assign a role equal to or higher than your own",
        )

    if caller.role_id == "LOB_ADMIN" and caller.lob_id:
        if lob_id and lob_id != caller.lob_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot assign users to a LOB outside your scope",
            )

    if caller.role_id == "TEAM_ADMIN":
        if team_id and team_id != caller.team_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot assign users to a team outside your scope",
            )


@router.get("", response_model=List[dict])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("LOB_ADMIN")),
):
    query = db.query(User)

    if current_user.role_id == "LOB_ADMIN" and current_user.lob_id:
        lob_team_ids = [t.id for t in db.query(OrgTeam).filter(OrgTeam.lob_id == current_user.lob_id).all()]
        query = query.filter(
            (User.lob_id == current_user.lob_id)
            | (User.team_id.in_(lob_team_ids))
        )

    users = query.all()
    return [_serialize_user(u) for u in users]


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("LOB_ADMIN")),
):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    role = db.query(Role).filter(Role.id == payload.role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role_id")

    _assert_scope(current_user, payload.role_id, payload.lob_id, payload.team_id)

    if payload.lob_id:
        if not db.query(Lob).filter(Lob.id == payload.lob_id).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lob_id")

    if payload.team_id:
        team = db.query(OrgTeam).filter(OrgTeam.id == payload.team_id).first()
        if not team:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team_id")
        if payload.lob_id and team.lob_id != payload.lob_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team does not belong to the specified LOB")

    if payload.project_id:
        project = db.query(Project).filter(Project.id == payload.project_id).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid project_id")
        if payload.team_id and project.team_id != payload.team_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project does not belong to the specified team")

    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role_id=payload.role_id,
        lob_id=payload.lob_id,
        team_id=payload.team_id,
        project_id=payload.project_id,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    write_audit_log(
        db=db,
        actor=current_user,
        action="CREATE",
        resource_type="User",
        resource_id=str(new_user.id),
        resource_name=new_user.email,
        details=f"Created user {new_user.email} with role {new_user.role_id}",
        ip_address=request.client.host if request.client else "",
    )

    db.commit()
    db.refresh(new_user)
    return _serialize_user(new_user)


@router.put("/{user_id}", response_model=dict)
def update_user(
    user_id: int,
    payload: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("LOB_ADMIN")),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify your own account via this endpoint")

    effective_role_id = payload.role_id or target.role_id
    effective_lob_id = payload.lob_id if payload.lob_id is not None else target.lob_id
    effective_team_id = payload.team_id if payload.team_id is not None else target.team_id

    _assert_scope(current_user, effective_role_id, effective_lob_id, effective_team_id)

    if payload.role_id is not None:
        if not db.query(Role).filter(Role.id == payload.role_id).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role_id")
        target.role_id = payload.role_id

    if payload.lob_id is not None:
        if payload.lob_id and not db.query(Lob).filter(Lob.id == payload.lob_id).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lob_id")
        target.lob_id = payload.lob_id

    if payload.team_id is not None:
        if payload.team_id:
            team = db.query(OrgTeam).filter(OrgTeam.id == payload.team_id).first()
            if not team:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team_id")
        target.team_id = payload.team_id

    if payload.project_id is not None:
        if payload.project_id:
            project = db.query(Project).filter(Project.id == payload.project_id).first()
            if not project:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid project_id")
        target.project_id = payload.project_id

    if payload.name is not None:
        target.name = payload.name

    if payload.is_active is not None:
        target.is_active = payload.is_active

    write_audit_log(
        db=db,
        actor=current_user,
        action="UPDATE",
        resource_type="User",
        resource_id=str(target.id),
        resource_name=target.email,
        details=f"Updated user {target.email}",
        ip_address=request.client.host if request.client else "",
    )

    db.commit()
    db.refresh(target)
    return _serialize_user(target)


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def deactivate_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("LOB_ADMIN")),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot deactivate your own account")

    caller_level = ROLE_HIERARCHY.get(current_user.role_id, 0)
    target_level = ROLE_HIERARCHY.get(target.role_id, 0)
    if target_level >= caller_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot deactivate a user with equal or higher privilege",
        )

    if current_user.role_id == "LOB_ADMIN" and current_user.lob_id:
        if target.lob_id != current_user.lob_id:
            lob_team_ids = [t.id for t in db.query(OrgTeam).filter(OrgTeam.lob_id == current_user.lob_id).all()]
            if target.team_id not in lob_team_ids:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is outside your LOB scope")

    target.is_active = False

    write_audit_log(
        db=db,
        actor=current_user,
        action="DEACTIVATE",
        resource_type="User",
        resource_id=str(target.id),
        resource_name=target.email,
        details=f"Deactivated user {target.email}",
        ip_address=request.client.host if request.client else "",
    )

    db.commit()
    return {"message": f"User {target.email} has been deactivated"}
