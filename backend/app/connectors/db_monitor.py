from app.connectors.base import BaseConnector, registry


class DatabaseMonitorConnector(BaseConnector):
    name = "Database Monitor"
    category = "Database"

    def validate_config(self) -> bool:
        required = ["connection_string", "db_type"]
        return all(k in self.config and self.config[k] for k in required)

    def test_connection(self) -> dict:
        if not self.validate_config():
            return {"success": False, "message": "Missing required configuration fields"}
        return {
            "success": True,
            "message": "Database Monitor connection verified (stub)",
            "db_type": self.config.get("db_type", "Unknown"),
            "latency_ms": 8,
        }

    def list_capabilities(self) -> list[str]:
        return ["Query Performance", "Connection Pools", "Replication Lag", "Deadlocks", "Slow Queries"]

    def execute_metric(self, metric_name: str, params: dict):
        metric_stubs = {
            "query_p99": {"value": 8.4, "unit": "ms", "source": "DBMonitor"},
            "connection_pool_pct": {"value": 72.0, "unit": "%", "source": "DBMonitor"},
            "active_connections": {"value": 143, "unit": "", "source": "DBMonitor"},
            "deadlocks": {"value": 0, "unit": "", "source": "DBMonitor"},
            "replication_lag": {"value": 0.2, "unit": "s", "source": "DBMonitor"},
        }
        return metric_stubs.get(metric_name, {"value": None, "unit": "", "source": "DBMonitor"})


registry.register("db-monitor", DatabaseMonitorConnector)
