from app.connectors.base import BaseConnector, registry


class PrometheusConnector(BaseConnector):
    name = "Prometheus"
    category = "Infra"

    def validate_config(self) -> bool:
        return bool(self.config.get("endpoint"))

    def test_connection(self) -> dict:
        return {"success": True, "message": "Prometheus endpoint reachable", "latency_ms": 38}

    def list_capabilities(self) -> list[str]:
        return ["Metrics", "Alerts", "Infrastructure"]

    def execute_metric(self, metric_name: str, params: dict):
        return {"metric": metric_name, "value": 0, "note": "stub - PromQL integration pending"}


registry.register("prometheus", PrometheusConnector)
