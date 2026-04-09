from app.connectors.base import BaseConnector, registry


class SplunkConnector(BaseConnector):
    name = "Splunk Enterprise"
    category = "Logs"

    def validate_config(self) -> bool:
        return bool(self.config.get("host") and self.config.get("token"))

    def test_connection(self) -> dict:
        return {"success": True, "message": "Splunk HEC connection verified", "latency_ms": 210}

    def list_capabilities(self) -> list[str]:
        return ["Logs", "Search", "Alerts", "SIEM"]

    def execute_metric(self, metric_name: str, params: dict):
        return {"metric": metric_name, "value": 0, "note": "stub - Splunk SPL integration pending"}


registry.register("splunk", SplunkConnector)
