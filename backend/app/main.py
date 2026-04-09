from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.seed.seeder import is_seeded, seed_all

import app.models  # noqa: F401 - ensure all models are registered

from app.api import dashboard, apps, connectors, health_rules, incidents, dependencies, insights, trends, teams, settings as settings_router

import app.connectors.datadog  # noqa: F401
import app.connectors.prometheus  # noqa: F401
import app.connectors.splunk  # noqa: F401
import app.connectors.custom_api  # noqa: F401


def create_tables():
    Base.metadata.create_all(bind=engine)


def bootstrap():
    create_tables()
    db = SessionLocal()
    try:
        if not is_seeded(db):
            seed_all(db)
    finally:
        db.close()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="HealthMesh enterprise application health intelligence platform API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    bootstrap()


app.include_router(dashboard.router)
app.include_router(apps.router)
app.include_router(connectors.router)
app.include_router(health_rules.router)
app.include_router(incidents.router)
app.include_router(dependencies.router)
app.include_router(insights.router)
app.include_router(trends.router)
app.include_router(teams.router)
app.include_router(settings_router.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "version": settings.app_version}


@app.get("/api/health")
def api_health():
    return {"status": "ok", "service": settings.app_name}
