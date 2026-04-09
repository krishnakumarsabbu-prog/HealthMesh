from typing import List
from sqlalchemy.orm import Session
from app.models import DependencyNode, DependencyEdge
from app.repositories.base import BaseRepository


class DependencyNodeRepository(BaseRepository[DependencyNode]):
    def __init__(self, db: Session):
        super().__init__(DependencyNode, db)

    def get_by_type(self, node_type: str) -> List[DependencyNode]:
        return self.db.query(DependencyNode).filter(DependencyNode.node_type == node_type).all()

    def get_by_status(self, status: str) -> List[DependencyNode]:
        return self.db.query(DependencyNode).filter(DependencyNode.status == status).all()


class DependencyEdgeRepository(BaseRepository[DependencyEdge]):
    def __init__(self, db: Session):
        super().__init__(DependencyEdge, db)

    def get_by_source(self, source_id: str) -> List[DependencyEdge]:
        return self.db.query(DependencyEdge).filter(DependencyEdge.source_id == source_id).all()

    def get_by_target(self, target_id: str) -> List[DependencyEdge]:
        return self.db.query(DependencyEdge).filter(DependencyEdge.target_id == target_id).all()

    def get_all_edges(self) -> List[DependencyEdge]:
        return self.db.query(DependencyEdge).all()
