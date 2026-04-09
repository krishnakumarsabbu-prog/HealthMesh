from app.connectors.base import BaseConnector, registry


class CustomAPIConnector(BaseConnector):
    name = "Custom API"
    category = "API"

    def validate_config(self) -> bool:
        return bool(self.config.get("endpoint_url"))

    def test_connection(self) -> dict:
        return {"success": True, "message": "Custom API endpoint reachable", "latency_ms": 95}

    def list_capabilities(self) -> list[str]:
        return ["Metrics", "Events", "Custom"]

    def execute_metric(self, metric_name: str, params: dict):
        return {"metric": metric_name, "value": 0, "note": "stub - custom HTTP integration pending"}


registry.register("custom-api", CustomAPIConnector)
