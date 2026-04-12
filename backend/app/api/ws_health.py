import asyncio
import json
import random
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.core.security import decode_access_token
from app.core.auth_deps import get_scoped_app_ids
from app.models.identity import User
from app.models.apps import Application

router = APIRouter()

BROADCAST_INTERVAL = 30


def _get_db() -> Session:
    return SessionLocal()


def _authenticate_token(token: str, db: Session) -> Optional[User]:
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        return None
    return user


def _build_app_health_payload(app: Application) -> dict:
    delta = random.uniform(-2.5, 2.5)
    new_score = max(0.0, min(100.0, app.health_score + delta))
    latency_jitter = random.uniform(-15, 15)
    new_latency = max(10.0, app.latency_p99 + latency_jitter)

    statuses = ["healthy", "healthy", "healthy", "warning", "critical"]
    weights = [0.7, 0.1, 0.05, 0.1, 0.05]
    new_status = random.choices(statuses, weights=weights, k=1)[0]

    return {
        "app_id": app.id,
        "name": app.name,
        "health_score": round(new_score, 1),
        "status": new_status,
        "latency_p99": round(new_latency, 1),
        "uptime": round(app.uptime + random.uniform(-0.001, 0.001), 3),
        "rpm": round(app.rpm + random.uniform(-50, 50), 0),
    }


def _build_summary_payload(app_payloads: list[dict]) -> dict:
    total = len(app_payloads)
    healthy = sum(1 for a in app_payloads if a["status"] == "healthy")
    warning = sum(1 for a in app_payloads if a["status"] == "warning")
    critical = sum(1 for a in app_payloads if a["status"] == "critical")
    avg_score = (
        round(sum(a["health_score"] for a in app_payloads) / total, 1) if total else 0
    )
    avg_latency = (
        round(sum(a["latency_p99"] for a in app_payloads) / total, 1) if total else 0
    )
    return {
        "total_apps": total,
        "healthy_apps": healthy,
        "warning_apps": warning,
        "critical_apps": critical,
        "avg_health_score": avg_score,
        "avg_latency": avg_latency,
    }


@router.websocket("/ws/health")
async def ws_health(
    websocket: WebSocket,
    token: str = Query(...),
):
    db = _get_db()
    try:
        user = _authenticate_token(token, db)
        if not user:
            await websocket.close(code=4001)
            return

        await websocket.accept()

        scoped_ids = get_scoped_app_ids(user, db)

        query = db.query(Application)
        if scoped_ids is not None:
            if len(scoped_ids) == 0:
                await websocket.send_text(json.dumps({
                    "type": "connected",
                    "message": "No apps in scope",
                    "app_count": 0,
                }))
                await websocket.close(code=1000)
                return
            query = query.filter(Application.id.in_(scoped_ids))

        apps = query.all()

        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": f"Streaming health for {len(apps)} app(s)",
            "app_count": len(apps),
            "user_role": user.role_id,
        }))

        while True:
            try:
                app_payloads = [_build_app_health_payload(a) for a in apps]
                summary = _build_summary_payload(app_payloads)

                payload = {
                    "type": "health_update",
                    "summary": summary,
                    "apps": app_payloads,
                }

                await websocket.send_text(json.dumps(payload))
                await asyncio.sleep(BROADCAST_INTERVAL)

            except WebSocketDisconnect:
                break
            except Exception:
                break

    except WebSocketDisconnect:
        pass
    finally:
        db.close()
