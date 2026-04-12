from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import DependencyService
from app.core.auth_deps import get_current_user, get_scoped_app_ids
from app.models.identity import User

router = APIRouter(prefix="/api/dependencies", tags=["dependencies"])


@router.get("/map")
def get_dependency_map(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app_ids = get_scoped_app_ids(current_user, db)
    svc = DependencyService(db)
    return svc.get_dependency_map(app_ids=app_ids)
