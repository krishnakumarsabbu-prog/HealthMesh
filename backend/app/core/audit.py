from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.settings import AuditLog
from app.models.identity import User


def write_audit_log(
    db: Session,
    actor: User,
    action: str,
    resource_type: str,
    resource_id: str,
    resource_name: str,
    details: str = "",
    ip_address: str = "",
) -> None:
    entry = AuditLog(
        user_name=actor.name,
        user_email=actor.email,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id),
        resource_name=resource_name,
        details=details,
        ip_address=ip_address,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
    db.add(entry)
    db.flush()
