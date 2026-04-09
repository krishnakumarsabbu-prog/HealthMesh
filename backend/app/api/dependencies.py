from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import DependencyNode, DependencyEdge

router = APIRouter(prefix="/api/dependencies", tags=["dependencies"])


@router.get("/map")
def get_dependency_map(db: Session = Depends(get_db)):
    nodes = db.query(DependencyNode).all()
    edges = db.query(DependencyEdge).all()
    return {
        "nodes": [{"id": n.id, "label": n.label, "node_type": n.node_type, "status": n.status, "latency": n.latency, "error_rate": n.error_rate, "rps": n.rps, "uptime": n.uptime, "version": n.version, "team": n.team, "x": n.x, "y": n.y} for n in nodes],
        "edges": [{"id": e.id, "source_id": e.source_id, "target_id": e.target_id, "status": e.status, "latency": e.latency, "label": e.label} for e in edges],
        "stats": {
            "total_services": len(nodes),
            "total_connections": len(edges),
            "degraded_paths": sum(1 for e in edges if e.status == "warning"),
            "critical_nodes": sum(1 for n in nodes if n.status == "critical"),
        }
    }
