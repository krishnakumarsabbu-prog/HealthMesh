from app.connectors.base import BaseConnector, registry


class AppDynamicsConnector(BaseConnector):
    name = "AppDynamics"
    category = "APM"

    def validate_config(self) -> bool:
        required = ["controller_url", "account_name", "api_client_id", "api_client_secret"]
        return all(k in self.config and self.config[k] for k in required)

    def test_connection(self) -> dict:
        if not self.validate_config():
            return {"success": False, "message": "Missing required configuration fields"}
        return {
            "success": True,
            "message": "AppDynamics connection verified (stub)",
            "controller": self.config.get("controller_url", ""),
            "latency_ms": 185,
        }

    def list_capabilities(self) -> list[str]:
        return ["APM", "Infrastructure", "Business Transactions", "Flow Maps", "Analytics"]

    def execute_metric(self, metric_name: str, params: dict):
        metric_stubs = {
            "latency_p99": {"value": 95.0, "unit": "ms", "source": "AppDynamics"},
            "error_rate": {"value": 0.12, "unit": "%", "source": "AppDynamics"},
            "throughput": {"value": 4200.0, "unit": "rpm", "source": "AppDynamics"},
            "apdex": {"value": 0.94, "unit": "", "source": "AppDynamics"},
        }
        return metric_stubs.get(metric_name, {"value": None, "unit": "", "source": "AppDynamics"})


registry.register("appdynamics", AppDynamicsConnector)
