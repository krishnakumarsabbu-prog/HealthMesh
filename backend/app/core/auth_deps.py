from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import decode_access_token
from app.models.identity import User, OrgTeam, Project

bearer_scheme = HTTPBearer(auto_error=False)

ROLE_HIERARCHY = {
    "LOB_ADMIN": 4,
    "TEAM_ADMIN": 3,
    "PROJECT_ADMIN": 2,
    "USER": 1,
}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    payload = decode_access_token(credentials.credentials)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return db.query(User).filter(User.id == int(user_id)).first()


def require_role(minimum_role: str):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        user_level = ROLE_HIERARCHY.get(current_user.role_id, 0)
        required_level = ROLE_HIERARCHY.get(minimum_role, 0)
        if user_level < required_level:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return dependency


def get_scoped_app_ids(user: User, db: Session) -> Optional[List[str]]:
    """
    Returns a list of app IDs the user is allowed to see, or None if the user has no restrictions.
    LOB_ADMIN without lob_id => no restriction (sees all).
    """
    role = user.role_id

    if role == "LOB_ADMIN":
        if not user.lob_id:
            return None
        lob_team_ids = [t.id for t in db.query(OrgTeam).filter(OrgTeam.lob_id == user.lob_id).all()]
        project_ids = [p.id for p in db.query(Project).filter(Project.team_id.in_(lob_team_ids)).all()]

    elif role == "TEAM_ADMIN":
        if not user.team_id:
            return None
        project_ids = [p.id for p in db.query(Project).filter(Project.team_id == user.team_id).all()]

    elif role in ("PROJECT_ADMIN", "USER"):
        if not user.project_id:
            return []
        project_ids = [user.project_id]

    else:
        return None

    from app.models import Application
    app_ids = [a.id for a in db.query(Application.id).filter(Application.project_id.in_(project_ids)).all()]
    return app_ids
