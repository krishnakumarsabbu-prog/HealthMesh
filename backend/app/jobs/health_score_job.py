import logging
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.services import HealthScoreService

logger = logging.getLogger(__name__)


def recalculate_all_health_scores():
    db: Session = SessionLocal()
    try:
        svc = HealthScoreService(db)
        results = svc.recalculate_all()
        logger.info(f"Health score recalculation complete: {len(results)} apps updated")
        return results
    except Exception as e:
        logger.error(f"Health score recalculation failed: {e}")
        return []
    finally:
        db.close()
