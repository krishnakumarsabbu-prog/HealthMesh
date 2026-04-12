import random
import math
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import AppConnectorAssignment, AppHealthPollResult, ConnectorInstance, Application


METRIC_SIMULATORS = {
    "datadog": {
        "capabilities": ["APM", "Infrastructure", "Logs", "Metrics"],
        "metrics": {
            "cpu_usage": lambda: round(random.uniform(20, 85), 1),
            "memory_usage": lambda: round(random.uniform(30, 90), 1),
            "error_rate": lambda: round(random.uniform(0.01, 3.5), 2),
            "p99_latency_ms": lambda: round(random.uniform(20, 450), 1),
            "throughput_rpm": lambda: round(random.uniform(800, 15000), 0),
            "apdex_score": lambda: round(random.uniform(0.75, 1.0), 3),
        }
    },
    "prometheus": {
        "capabilities": ["Metrics", "Alerting", "Time-Series"],
        "metrics": {
            "http_request_duration_p99": lambda: round(random.uniform(15, 500), 2),
            "http_requests_total": lambda: int(random.uniform(5000, 200000)),
            "process_cpu_seconds_total": lambda: round(random.uniform(0.1, 4.5), 2),
            "go_memstats_heap_inuse_bytes": lambda: int(random.uniform(10_000_000, 500_000_000)),
            "up": lambda: 1 if random.random() > 0.05 else 0,
        }
    },
    "splunk": {
        "capabilities": ["Logs", "SIEM", "Observability"],
        "metrics": {
            "error_events_last_hour": lambda: int(random.uniform(0, 250)),
            "warn_events_last_hour": lambda: int(random.uniform(0, 800)),
            "log_ingestion_rate_eps": lambda: round(random.uniform(50, 5000), 1),
            "search_concurrency": lambda: int(random.uniform(1, 12)),
            "index_lag_seconds": lambda: round(random.uniform(0, 30), 1),
        }
    },
    "appdynamics": {
        "capabilities": ["APM", "Business Transactions", "Database Monitoring"],
        "metrics": {
            "business_txn_error_rate": lambda: round(random.uniform(0.0, 5.0), 2),
            "avg_response_time_ms": lambda: round(random.uniform(10, 600), 1),
            "calls_per_minute": lambda: round(random.uniform(100, 10000), 0),
            "db_query_time_ms": lambda: round(random.uniform(1, 200), 1),
            "thread_pool_active": lambda: int(random.uniform(1, 50)),
        }
    },
    "logicmonitor": {
        "capabilities": ["Infrastructure", "Cloud", "Network"],
        "metrics": {
            "disk_utilization_pct": lambda: round(random.uniform(10, 92), 1),
            "network_throughput_mbps": lambda: round(random.uniform(0.5, 950), 1),
            "host_cpu_pct": lambda: round(random.uniform(5, 95), 1),
            "host_mem_pct": lambda: round(random.uniform(20, 95), 1),
            "alert_count_active": lambda: int(random.uniform(0, 15)),
        }
    },
    "custom_api": {
        "capabilities": ["Custom Metrics", "Webhooks"],
        "metrics": {
            "custom_health_score": lambda: round(random.uniform(60, 100), 1),
            "api_response_ms": lambda: round(random.uniform(5, 300), 1),
            "success_rate_pct": lambda: round(random.uniform(90, 100), 2),
        }
    },
}

_DEFAULT_SIMULATOR = {
    "capabilities": ["Health Check"],
    "metrics": {
        "health_score": lambda: round(random.uniform(70, 100), 1),
        "response_time_ms": lambda: round(random.uniform(10, 500), 1),
    }
}


def _get_simulator(category: str) -> dict:
    key = category.lower().replace(" ", "_").replace("-", "_")
    for k, v in METRIC_SIMULATORS.items():
        if k in key or key in k:
            return v
    return _DEFAULT_SIMULATOR


def _compute_health_score(metrics: Dict[str, Any], simulator_key: str) -> float:
    score = 100.0

    if "error_rate" in metrics:
        er = float(metrics["error_rate"])
        score -= min(er * 10, 30)

    if "business_txn_error_rate" in metrics:
        er = float(metrics["business_txn_error_rate"])
        score -= min(er * 8, 25)

    if "cpu_usage" in metrics or "host_cpu_pct" in metrics:
        cpu = float(metrics.get("cpu_usage", metrics.get("host_cpu_pct", 50)))
        if cpu > 85:
            score -= 20
        elif cpu > 70:
            score -= 10

    if "memory_usage" in metrics or "host_mem_pct" in metrics:
        mem = float(metrics.get("memory_usage", metrics.get("host_mem_pct", 50)))
        if mem > 90:
            score -= 15
        elif mem > 80:
            score -= 8

    if "p99_latency_ms" in metrics or "avg_response_time_ms" in metrics or "http_request_duration_p99" in metrics:
        lat = float(metrics.get("p99_latency_ms", metrics.get("avg_response_time_ms", metrics.get("http_request_duration_p99", 100))))
        if lat > 300:
            score -= 15
        elif lat > 150:
            score -= 7

    if "up" in metrics:
        if int(metrics["up"]) == 0:
            score -= 50

    if "error_events_last_hour" in metrics:
        err = int(metrics["error_events_last_hour"])
        if err > 100:
            score -= 20
        elif err > 30:
            score -= 10

    if "apdex_score" in metrics:
        apdex = float(metrics["apdex_score"])
        if apdex < 0.85:
            score -= (0.85 - apdex) * 40

    if "custom_health_score" in metrics:
        custom = float(metrics["custom_health_score"])
        score = (score + custom) / 2

    return max(0.0, min(100.0, round(score, 1)))


def _determine_status(health_score: float) -> str:
    if health_score >= 85:
        return "healthy"
    elif health_score >= 65:
        return "warning"
    else:
        return "critical"


class HealthCheckOrchestrator:
    def __init__(self, db: Session):
        self.db = db

    def get_app_connectors(self, app_id: str) -> List[Dict[str, Any]]:
        assignments = (
            self.db.query(AppConnectorAssignment)
            .filter(AppConnectorAssignment.app_id == app_id, AppConnectorAssignment.enabled == True)
            .all()
        )
        result = []
        for asgn in assignments:
            inst = self.db.query(ConnectorInstance).filter(ConnectorInstance.id == asgn.connector_instance_id).first()
            if inst:
                result.append({
                    "assignment_id": asgn.id,
                    "connector_instance_id": inst.id,
                    "connector_name": inst.name,
                    "connector_category": inst.category,
                    "environment": inst.environment,
                    "status": inst.status,
                    "enabled": asgn.enabled,
                    "poll_interval_seconds": asgn.poll_interval_seconds,
                    "assigned_by": asgn.assigned_by,
                })
        return result

    def assign_connector(self, app_id: str, connector_instance_id: str, assigned_by: Optional[str] = None, poll_interval_seconds: int = 60) -> Dict[str, Any]:
        existing = (
            self.db.query(AppConnectorAssignment)
            .filter(
                AppConnectorAssignment.app_id == app_id,
                AppConnectorAssignment.connector_instance_id == connector_instance_id,
            )
            .first()
        )
        if existing:
            existing.enabled = True
            existing.poll_interval_seconds = poll_interval_seconds
            self.db.commit()
            self.db.refresh(existing)
            return {"assignment_id": existing.id, "app_id": app_id, "connector_instance_id": connector_instance_id, "enabled": True}

        asgn = AppConnectorAssignment(
            app_id=app_id,
            connector_instance_id=connector_instance_id,
            enabled=True,
            poll_interval_seconds=poll_interval_seconds,
            assigned_by=assigned_by,
        )
        self.db.add(asgn)

        inst = self.db.query(ConnectorInstance).filter(ConnectorInstance.id == connector_instance_id).first()
        if inst:
            inst.app_count = (inst.app_count or 0) + 1

        self.db.commit()
        self.db.refresh(asgn)
        return {"assignment_id": asgn.id, "app_id": app_id, "connector_instance_id": connector_instance_id, "enabled": True}

    def remove_connector(self, app_id: str, connector_instance_id: str) -> bool:
        asgn = (
            self.db.query(AppConnectorAssignment)
            .filter(
                AppConnectorAssignment.app_id == app_id,
                AppConnectorAssignment.connector_instance_id == connector_instance_id,
            )
            .first()
        )
        if not asgn:
            return False
        self.db.delete(asgn)

        inst = self.db.query(ConnectorInstance).filter(ConnectorInstance.id == connector_instance_id).first()
        if inst and inst.app_count > 0:
            inst.app_count -= 1

        self.db.commit()
        return True

    def run_health_check(self, app_id: str) -> Dict[str, Any]:
        assignments = (
            self.db.query(AppConnectorAssignment)
            .filter(AppConnectorAssignment.app_id == app_id, AppConnectorAssignment.enabled == True)
            .all()
        )

        if not assignments:
            return {
                "app_id": app_id,
                "composite_health_score": None,
                "overall_status": "unconfigured",
                "connector_results": [],
                "checked_at": datetime.utcnow().isoformat(),
                "message": "No connectors assigned to this application",
            }

        connector_results = []
        total_score = 0.0
        count = 0

        for asgn in assignments:
            inst = self.db.query(ConnectorInstance).filter(ConnectorInstance.id == asgn.connector_instance_id).first()
            if not inst:
                continue

            sim = _get_simulator(inst.category)
            metrics = {k: fn() for k, fn in sim["metrics"].items()}

            noise = random.uniform(-5, 5)
            raw_score = _compute_health_score(metrics, inst.category) + noise
            health_score = max(0.0, min(100.0, round(raw_score, 1)))
            status = _determine_status(health_score)

            poll_result = AppHealthPollResult(
                app_id=app_id,
                connector_instance_id=inst.id,
                connector_name=inst.name,
                connector_category=inst.category,
                status=status,
                health_score=health_score,
                metrics=metrics,
                raw_response={"source": inst.name, "environment": inst.environment, "capabilities": sim["capabilities"]},
                polled_at=datetime.utcnow(),
            )
            self.db.add(poll_result)

            inst.last_sync = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            inst.health_pct = health_score
            inst.status = status

            total_score += health_score
            count += 1

            connector_results.append({
                "connector_instance_id": inst.id,
                "connector_name": inst.name,
                "connector_category": inst.category,
                "environment": inst.environment,
                "health_score": health_score,
                "status": status,
                "metrics": metrics,
                "capabilities": sim["capabilities"],
                "polled_at": datetime.utcnow().isoformat(),
            })

        self.db.commit()

        composite_score = round(total_score / count, 1) if count > 0 else None
        overall_status = _determine_status(composite_score) if composite_score is not None else "unknown"

        app = self.db.query(Application).filter(Application.id == app_id).first()
        if app and composite_score is not None:
            app.health_score = composite_score
            app.status = overall_status
            self.db.commit()

        return {
            "app_id": app_id,
            "composite_health_score": composite_score,
            "overall_status": overall_status,
            "connector_count": count,
            "connector_results": connector_results,
            "checked_at": datetime.utcnow().isoformat(),
        }

    def get_latest_poll_results(self, app_id: str) -> List[Dict[str, Any]]:
        seen_connectors = set()
        results = []

        all_results = (
            self.db.query(AppHealthPollResult)
            .filter(AppHealthPollResult.app_id == app_id)
            .order_by(AppHealthPollResult.polled_at.desc())
            .limit(50)
            .all()
        )

        for r in all_results:
            if r.connector_instance_id not in seen_connectors:
                seen_connectors.add(r.connector_instance_id)
                results.append({
                    "connector_instance_id": r.connector_instance_id,
                    "connector_name": r.connector_name,
                    "connector_category": r.connector_category,
                    "health_score": r.health_score,
                    "status": r.status,
                    "metrics": r.metrics,
                    "polled_at": r.polled_at.isoformat() if r.polled_at else None,
                })

        return results
