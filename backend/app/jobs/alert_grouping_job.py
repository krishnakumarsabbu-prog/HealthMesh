import logging
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models import Alert

logger = logging.getLogger(__name__)


def group_alerts():
    db: Session = SessionLocal()
    try:
        alerts = db.query(Alert).filter(Alert.status == "firing").all()
        grouped = {}
        for alert in alerts:
            key = (alert.app_id, alert.metric)
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(alert.id)
        logger.info(f"Alert grouping: {len(grouped)} groups from {len(alerts)} firing alerts")
        return grouped
    except Exception as e:
        logger.error(f"Alert grouping failed: {e}")
        return {}
    finally:
        db.close()
