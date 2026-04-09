from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services import DependencyService

router = APIRouter(prefix="/api/dependencies", tags=["dependencies"])


@router.get("/map")
def get_dependency_map(db: Session = Depends(get_db)):
    svc = DependencyService(db)
    return svc.get_dependency_map()
