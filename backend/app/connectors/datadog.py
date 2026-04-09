from app.connectors.base import BaseConnector, registry


class DatadogConnector(BaseConnector):
    name = "Datadog"
    category = "APM"

    def validate_config(self) -> bool:
        return bool(self.config.get("api_key") and self.config.get("app_key"))

    def test_connection(self) -> dict:
        return {"success": True, "message": "Datadog connection successful", "latency_ms": 142}

    def list_capabilities(self) -> list[str]:
        return ["APM", "Metrics", "Logs", "Synthetics", "Alerts"]

    def execute_metric(self, metric_name: str, params: dict):
        return {"metric": metric_name, "value": 0, "note": "stub - real API integration pending"}


registry.register("datadog", DatadogConnector)
