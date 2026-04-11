from app.core.security import get_password_hash

ROLES = [
    {"id": "LOB_ADMIN", "name": "LOB Admin", "description": "Manages everything under a Line of Business"},
    {"id": "TEAM_ADMIN", "name": "Team Admin", "description": "Manages a team, its projects, and applications"},
    {"id": "PROJECT_ADMIN", "name": "Project Admin", "description": "Manages applications within a project"},
    {"id": "USER", "name": "Viewer", "description": "View-only access to assigned project dashboards"},
]

LOBS = [
    {"id": "dti", "name": "DTI", "description": "Digital Technology & Innovation"},
    {"id": "retail-banking", "name": "Retail Banking", "description": "Consumer and retail banking services"},
    {"id": "insurance", "name": "Insurance", "description": "Insurance products and claims processing"},
]

ORG_TEAMS = [
    {"id": "dti-core", "name": "DTI Core Team", "lob_id": "dti"},
    {"id": "payments-org", "name": "Payments Team", "lob_id": "retail-banking"},
    {"id": "claims-org", "name": "Claims Team", "lob_id": "insurance"},
]

PROJECTS = [
    {"id": "dti-payments-platform", "name": "DTI Payments Platform", "team_id": "dti-core"},
    {"id": "customer-auth-revamp", "name": "Customer Auth Revamp", "team_id": "dti-core"},
    {"id": "claims-modernization", "name": "Claims Modernization", "team_id": "claims-org"},
]

APP_PROJECT_MAPPINGS = {
    "payments-api": "dti-payments-platform",
    "customer-auth-service": "customer-auth-revamp",
    "order-processing-gateway": "dti-payments-platform",
    "search-api": "dti-payments-platform",
    "recommendation-engine": "customer-auth-revamp",
    "notification-engine": "customer-auth-revamp",
    "inventory-service": "dti-payments-platform",
    "claims-portal-api": "claims-modernization",
    "fraud-detection-service": "claims-modernization",
    "reporting-hub": "claims-modernization",
    "identity-service": "customer-auth-revamp",
    "customer-360-platform": "customer-auth-revamp",
    "api-gateway": "dti-payments-platform",
}

SEED_USERS = [
    {
        "name": "DTI LOB Admin",
        "email": "lob_admin@dti.com",
        "password": "Admin@123",
        "role_id": "LOB_ADMIN",
        "lob_id": "dti",
        "team_id": "dti-core",
        "project_id": None,
    },
    {
        "name": "Team Admin",
        "email": "team_admin@dti.com",
        "password": "Admin@123",
        "role_id": "TEAM_ADMIN",
        "lob_id": "dti",
        "team_id": "dti-core",
        "project_id": "dti-payments-platform",
    },
    {
        "name": "Project Admin",
        "email": "project_admin@dti.com",
        "password": "Admin@123",
        "role_id": "PROJECT_ADMIN",
        "lob_id": "dti",
        "team_id": "dti-core",
        "project_id": "customer-auth-revamp",
    },
    {
        "name": "Standard User",
        "email": "user1@dti.com",
        "password": "User@123",
        "role_id": "USER",
        "lob_id": "dti",
        "team_id": "dti-core",
        "project_id": "dti-payments-platform",
    },
]


def get_hashed_users():
    users = []
    for u in SEED_USERS:
        user = dict(u)
        user["password_hash"] = get_password_hash(user.pop("password"))
        users.append(user)
    return users
