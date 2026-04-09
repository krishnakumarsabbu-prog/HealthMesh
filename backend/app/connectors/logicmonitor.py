from app.connectors.base import BaseConnector, registry


class LogicMonitorConnector(BaseConnector):
    name = "LogicMonitor"
    category = "Infra"

    def validate_config(self) -> bool:
        required = ["company", "access_id", "access_key"]
        return all(k in self.config and self.config[k] for k in required)

    def test_connection(self) -> dict:
        if not self.validate_config():
            return {"success": False, "message": "Missing required configuration fields"}
        return {
            "success": True,
            "message": "LogicMonitor connection verified (stub)",
            "company": self.config.get("company", ""),
            "latency_ms": 210,
        }

    def list_capabilities(self) -> list[str]:
        return ["Infrastructure", "Cloud", "Network", "Hybrid IT", "NOC Automation"]

    def execute_metric(self, metric_name: str, params: dict):
        metric_stubs = {
            "cpu_pct": {"value": 55.0, "unit": "%", "source": "LogicMonitor"},
            "memory_pct": {"value": 68.0, "unit": "%", "source": "LogicMonitor"},
            "disk_pct": {"value": 42.0, "unit": "%", "source": "LogicMonitor"},
            "network_in": {"value": 125.4, "unit": "Mbps", "source": "LogicMonitor"},
            "network_out": {"value": 89.2, "unit": "Mbps", "source": "LogicMonitor"},
        }
        return metric_stubs.get(metric_name, {"value": None, "unit": "", "source": "LogicMonitor"})


registry.register("logicmonitor", LogicMonitorConnector)
