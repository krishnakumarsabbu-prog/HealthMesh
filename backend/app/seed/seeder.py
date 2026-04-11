from sqlalchemy.orm import Session
from app.seed.data import (
    TEAMS, TEAM_MEMBERS, ENVIRONMENTS, APPLICATIONS,
    APP_SIGNALS, APP_TRANSACTIONS, APP_LOG_PATTERNS, APP_INFRA_PODS,
    APP_DEPENDENCIES, APP_ENDPOINTS, APP_HEALTH_SCORES,
    CONNECTOR_TEMPLATES, CONNECTOR_INSTANCES,
    HEALTH_RULES, INCIDENTS, ALERTS,
    DEPENDENCY_NODES, DEPENDENCY_EDGES,
    AI_INSIGHTS, DASHBOARD_SNAPSHOTS,
    TREND_DATA_MONTHLY, TREND_DATA_WEEKLY,
    MAINTENANCE_WINDOWS, SLA_SETTINGS, AUDIT_LOGS, APP_SETTINGS_DATA,
)
from app.seed.identity_data import ROLES, LOBS, ORG_TEAMS, PROJECTS, APP_PROJECT_MAPPINGS, get_hashed_users
from app.models import (
    Team, TeamMember, Environment, Application, AppHealthScore,
    AppSignal, AppTransaction, AppLogPattern, AppInfraPod,
    AppDependency, AppEndpoint,
    ConnectorTemplate, ConnectorInstance,
    HealthRule,
    Incident, Alert,
    DependencyNode, DependencyEdge,
    AiInsight, DashboardSnapshot, TrendDataPoint,
    MaintenanceWindow, SLASetting, AuditLog, AppSettings,
    Role, Lob, OrgTeam, Project, User,
)


def is_seeded(db: Session) -> bool:
    return db.query(Team).count() > 0


def seed_all(db: Session):
    print("Seeding database with realistic enterprise data...")
    _seed_identity(db)
    _seed_teams(db)
    _seed_environments(db)
    _seed_applications(db)
    _seed_app_project_mappings(db)
    _seed_app_data(db)
    _seed_connectors(db)
    _seed_health_rules(db)
    _seed_incidents_alerts(db)
    _seed_dependencies(db)
    _seed_insights(db)
    _seed_dashboard_data(db)
    _seed_trends(db)
    _seed_settings(db)
    db.commit()
    print("Seeding complete.")


def _seed_identity(db: Session):
    for r in ROLES:
        db.add(Role(**r))
    db.flush()
    for l in LOBS:
        db.add(Lob(**l))
    db.flush()
    for t in ORG_TEAMS:
        db.add(OrgTeam(**t))
    db.flush()
    for p in PROJECTS:
        db.add(Project(**p))
    db.flush()
    for u in get_hashed_users():
        db.add(User(**u))
    db.flush()


def _seed_app_project_mappings(db: Session):
    for app_id, project_id in APP_PROJECT_MAPPINGS.items():
        app = db.query(Application).filter(Application.id == app_id).first()
        if app:
            app.project_id = project_id
    db.flush()


def _seed_teams(db: Session):
    for t in TEAMS:
        team = Team(**t)
        db.add(team)
    db.flush()
    for team_id, members in TEAM_MEMBERS.items():
        for m in members:
            db.add(TeamMember(team_id=team_id, **m))
    db.flush()


def _seed_environments(db: Session):
    for e in ENVIRONMENTS:
        db.add(Environment(**e))
    db.flush()


def _seed_applications(db: Session):
    for app in APPLICATIONS:
        db.add(Application(**app))
    db.flush()


def _seed_app_data(db: Session):
    for app_id, signals in APP_SIGNALS.items():
        for s in signals:
            db.add(AppSignal(app_id=app_id, **s))

    for app_id, txns in APP_TRANSACTIONS.items():
        for t in txns:
            db.add(AppTransaction(app_id=app_id, **t))

    for app_id, logs in APP_LOG_PATTERNS.items():
        for l in logs:
            db.add(AppLogPattern(app_id=app_id, **l))

    for app_id, pods in APP_INFRA_PODS.items():
        for p in pods:
            db.add(AppInfraPod(app_id=app_id, **p))

    for app_id, deps in APP_DEPENDENCIES.items():
        for d in deps:
            db.add(AppDependency(app_id=app_id, **d))

    for app_id, endpoints in APP_ENDPOINTS.items():
        for ep in endpoints:
            db.add(AppEndpoint(app_id=app_id, **ep))

    for app_id, scores in APP_HEALTH_SCORES.items():
        for s in scores:
            db.add(AppHealthScore(app_id=app_id, **s))

    db.flush()


def _seed_connectors(db: Session):
    for t in CONNECTOR_TEMPLATES:
        db.add(ConnectorTemplate(**t))
    db.flush()
    for c in CONNECTOR_INSTANCES:
        db.add(ConnectorInstance(**c))
    db.flush()


def _seed_health_rules(db: Session):
    for r in HEALTH_RULES:
        db.add(HealthRule(**r))
    db.flush()


def _seed_incidents_alerts(db: Session):
    for inc in INCIDENTS:
        db.add(Incident(**inc))
    for alt in ALERTS:
        db.add(Alert(**alt))
    db.flush()


def _seed_dependencies(db: Session):
    for node in DEPENDENCY_NODES:
        db.add(DependencyNode(**node))
    db.flush()
    for edge in DEPENDENCY_EDGES:
        db.add(DependencyEdge(**edge))
    db.flush()


def _seed_insights(db: Session):
    for ins in AI_INSIGHTS:
        db.add(AiInsight(**ins))
    db.flush()


def _seed_dashboard_data(db: Session):
    for snap in DASHBOARD_SNAPSHOTS:
        db.add(DashboardSnapshot(**snap))
    db.flush()


def _seed_trends(db: Session):
    for t in TREND_DATA_MONTHLY:
        db.add(TrendDataPoint(**t))
    for t in TREND_DATA_WEEKLY:
        db.add(TrendDataPoint(**t))
    db.flush()


def _seed_settings(db: Session):
    for mw in MAINTENANCE_WINDOWS:
        db.add(MaintenanceWindow(**mw))
    for sla in SLA_SETTINGS:
        db.add(SLASetting(**sla))
    for log in AUDIT_LOGS:
        db.add(AuditLog(**log))
    for s in APP_SETTINGS_DATA:
        db.add(AppSettings(**s))
    db.flush()
