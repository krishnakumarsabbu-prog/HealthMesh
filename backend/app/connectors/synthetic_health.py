from app.connectors.base import BaseConnector, registry


class SyntheticHealthConnector(BaseConnector):
    name = "Synthetic Health"
    category = "Synthetic"

    def validate_config(self) -> bool:
        required = ["api_key", "locations"]
        return all(k in self.config and self.config[k] for k in required)

    def test_connection(self) -> dict:
        if not self.validate_config():
            return {"success": False, "message": "Missing required configuration fields"}
        return {
            "success": True,
            "message": "Synthetic Health connection verified (stub)",
            "locations": self.config.get("locations", []),
            "latency_ms": 320,
        }

    def list_capabilities(self) -> list[str]:
        return ["Browser Tests", "API Tests", "Uptime Checks", "Global CDN", "SSL Monitoring"]

    def execute_metric(self, metric_name: str, params: dict):
        metric_stubs = {
            "uptime_pct": {"value": 99.97, "unit": "%", "source": "Synthetic"},
            "response_time": {"value": 1.24, "unit": "s", "source": "Synthetic"},
            "check_pass_rate": {"value": 98.5, "unit": "%", "source": "Synthetic"},
            "ssl_expiry_days": {"value": 312, "unit": "days", "source": "Synthetic"},
        }
        return metric_stubs.get(metric_name, {"value": None, "unit": "", "source": "Synthetic"})


registry.register("synthetic-health", SyntheticHealthConnector)
