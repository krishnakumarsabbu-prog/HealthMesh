from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import Team, TeamMember, Environment, AppSettings

router = APIRouter(prefix="/api", tags=["teams"])


@router.get("/teams")
def list_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    result = []
    for t in teams:
        members = db.query(TeamMember).filter(TeamMember.team_id == t.id).all()
        result.append({
            "id": t.id,
            "name": t.name,
            "tier": t.tier,
            "health_score": t.health_score,
            "incident_count": t.incident_count,
            "lead_name": t.lead_name,
            "slack_channel": t.slack_channel,
            "description": t.description,
            "members": [{"id": m.id, "name": m.name, "initials": m.initials, "role": m.role, "email": m.email, "on_call": m.on_call} for m in members],
        })
    return result


@router.get("/teams/{team_id}")
def get_team(team_id: str, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    members = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()
    return {
        "id": team.id,
        "name": team.name,
        "tier": team.tier,
        "health_score": team.health_score,
        "incident_count": team.incident_count,
        "lead_name": team.lead_name,
        "slack_channel": team.slack_channel,
        "description": team.description,
        "members": [{"id": m.id, "name": m.name, "initials": m.initials, "role": m.role, "email": m.email, "on_call": m.on_call} for m in members],
    }


@router.get("/environments")
def list_environments(db: Session = Depends(get_db)):
    envs = db.query(Environment).all()
    return [{"id": e.id, "name": e.name, "health_score": e.health_score, "app_count": e.app_count, "incident_count": e.incident_count, "status": e.status} for e in envs]


@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(AppSettings).all()
    return {s.key: s.value for s in settings}


@router.put("/settings/{key}")
def update_setting(key: str, payload: dict, db: Session = Depends(get_db)):
    setting = db.query(AppSettings).filter(AppSettings.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    if "value" in payload:
        setting.value = payload["value"]
        db.commit()
    return {"key": key, "value": setting.value}
