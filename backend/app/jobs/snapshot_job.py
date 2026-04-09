import logging
import math
import random
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models import Application, Incident, Alert, DashboardSnapshot

logger = logging.getLogger(__name__)


def take_dashboard_snapshot():
    db: Session = SessionLocal()
    try:
        apps = db.query(Application).all()
        total = len(apps)
        if total == 0:
            return

        avg_score = sum(a.health_score for a in apps) / total
        active_incidents = db.query(Incident).filter(Incident.status == "active").count()
        firing_alerts = db.query(Alert).filter(Alert.status == "firing").count()
        healthy = sum(1 for a in apps if a.status == "healthy")
        degraded = sum(1 for a in apps if a.status == "warning")
        critical = sum(1 for a in apps if a.status == "critical")

        from datetime import datetime
        hour_label = datetime.utcnow().strftime("%H:00")

        snapshot = DashboardSnapshot(
            hour_label=hour_label,
            health_score=round(avg_score + random.uniform(-1, 1), 1),
            incidents=active_incidents,
            alerts=firing_alerts,
            healthy_apps=healthy,
            degraded_apps=degraded,
            critical_apps=critical,
        )
        db.add(snapshot)
        db.commit()
        logger.info(f"Dashboard snapshot taken for {hour_label}")
    except Exception as e:
        logger.error(f"Snapshot job failed: {e}")
    finally:
        db.close()
