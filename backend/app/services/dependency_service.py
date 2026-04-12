from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import DependencyNode, DependencyEdge


class DependencyService:
    def __init__(self, db: Session):
        self.db = db

    def get_dependency_map(self, app_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        node_q = self.db.query(DependencyNode)
        if app_ids is not None:
            node_q = node_q.filter(DependencyNode.id.in_(app_ids))
        nodes = node_q.all()

        node_id_set = {n.id for n in nodes}
        edge_q = self.db.query(DependencyEdge)
        if app_ids is not None:
            edge_q = edge_q.filter(
                DependencyEdge.source_id.in_(node_id_set),
                DependencyEdge.target_id.in_(node_id_set),
            )
        edges = edge_q.all()

        node_data = [self._serialize_node(n) for n in nodes]
        edge_data = [self._serialize_edge(e) for e in edges]
        stats = self._compute_stats(nodes, edges)

        return {
            "nodes": node_data,
            "edges": edge_data,
            "stats": stats,
        }

    def _serialize_node(self, n) -> Dict[str, Any]:
        return {
            "id": n.id,
            "label": n.label,
            "node_type": n.node_type,
            "status": n.status,
            "latency": n.latency,
            "error_rate": n.error_rate,
            "rps": n.rps,
            "uptime": n.uptime,
            "version": n.version,
            "team": n.team,
            "x": n.x,
            "y": n.y,
        }

    def _serialize_edge(self, e) -> Dict[str, Any]:
        return {
            "source_id": e.source_id,
            "target_id": e.target_id,
            "status": e.status,
            "latency": e.latency,
            "label": e.label,
        }

    def _compute_stats(self, nodes, edges) -> Dict[str, Any]:
        total_nodes = len(nodes)
        healthy = sum(1 for n in nodes if n.status == "healthy")
        degraded = sum(1 for n in nodes if n.status == "warning")
        critical = sum(1 for n in nodes if n.status == "critical")
        return {
            "total_nodes": total_nodes,
            "healthy": healthy,
            "degraded": degraded,
            "critical": critical,
            "total_edges": len(edges),
        }
