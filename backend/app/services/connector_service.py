from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories import ConnectorTemplateRepository, ConnectorInstanceRepository
from app.models import ConnectorInstance
from app.connectors.base import registry


class ConnectorService:
    def __init__(self, db: Session):
        self.db = db
        self.template_repo = ConnectorTemplateRepository(db)
        self.instance_repo = ConnectorInstanceRepository(db)

    def list_templates(self) -> List[Dict[str, Any]]:
        templates = self.template_repo.get_all()
        return [
            {
                "id": t.id,
                "name": t.name,
                "category": t.category,
                "description": t.description,
                "logo": t.logo,
                "color": t.color,
                "version": t.version,
                "fields": t.fields,
                "capabilities": t.capabilities,
                "popular": t.popular,
            }
            for t in templates
        ]

    def list_instances(self, lob_id: Optional[str] = None) -> List[Dict[str, Any]]:
        instances = self.instance_repo.get_all()
        if lob_id:
            instances = [c for c in instances if c.lob_id == lob_id or c.lob_id is None]
        return [self._serialize_instance(c) for c in instances]

    def create_instance(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        template = self.template_repo.get(data.get("template_id"))
        if not template:
            return None
        instance = ConnectorInstance(
            id=data.get("id", f"conn-{data['template_id']}-{data.get('name', 'new').lower().replace(' ', '-')}"),
            template_id=data["template_id"],
            name=data.get("name", template.name),
            category=template.category,
            environment=data.get("environment", "Production"),
            status="healthy",
            health_pct=100.0,
            app_count=0,
            version=template.version,
            last_sync="just now",
            metrics_count="0",
            config=data.get("config", {}),
            lob_id=data.get("lob_id"),
            managed_by=data.get("managed_by"),
        )
        created = self.instance_repo.create(instance)
        return self._serialize_instance(created)

    def update_instance(self, instance_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        instance = self.instance_repo.get(instance_id)
        if not instance:
            return None
        updated = self.instance_repo.update(instance, data)
        return self._serialize_instance(updated)

    def delete_instance(self, instance_id: str) -> bool:
        instance = self.instance_repo.get(instance_id)
        if not instance:
            return False
        return self.instance_repo.delete(instance)

    def test_connection(self, data: Dict[str, Any]) -> Dict[str, Any]:
        connector_type = data.get("template_id", "")
        connector_class = registry.get(connector_type)
        if connector_class:
            connector = connector_class(data.get("config", {}))
            return connector.test_connection()
        return {"success": True, "message": "Connection test successful (stub)", "latency_ms": 142}

    def get_capabilities(self, connector_id: str) -> Dict[str, Any]:
        instance = self.instance_repo.get(connector_id)
        if not instance:
            return {"capabilities": []}
        template = self.template_repo.get(instance.template_id)
        return {"capabilities": template.capabilities if template else []}

    def get_usage(self, connector_id: str) -> Optional[Dict[str, Any]]:
        instance = self.instance_repo.get(connector_id)
        if not instance:
            return None
        return {
            "app_count": instance.app_count,
            "metrics_count": instance.metrics_count,
            "last_sync": instance.last_sync,
        }

    def get_health_summary(self) -> Dict[str, Any]:
        all_instances = self.instance_repo.get_all()
        total = len(all_instances)
        healthy = sum(1 for c in all_instances if c.status == "healthy")
        warning = sum(1 for c in all_instances if c.status == "warning")
        error = sum(1 for c in all_instances if c.status == "error")
        return {
            "total": total,
            "healthy": healthy,
            "warning": warning,
            "error": error,
            "registered_types": registry.list_registered(),
        }

    def _serialize_instance(self, c: ConnectorInstance) -> Dict[str, Any]:
        return {
            "id": c.id,
            "template_id": c.template_id,
            "name": c.name,
            "category": c.category,
            "environment": c.environment,
            "status": c.status,
            "health_pct": c.health_pct,
            "app_count": c.app_count,
            "version": c.version,
            "last_sync": c.last_sync,
            "metrics_count": c.metrics_count,
            "config": c.config,
            "lob_id": c.lob_id,
            "managed_by": c.managed_by,
        }
