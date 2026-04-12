from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    app_name: str = "HealthMesh API"
    app_version: str = "1.0.0"
    debug: bool = True
    database_url: str = f"sqlite:///{BASE_DIR}/healthmesh.db"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000",
                               "http://127.0.0.1:5173", "http://localhost:5174"]
    secret_key: str = "healthmesh-secret-key-change-in-production-2024"

    class Config:
        env_file = ".env"


settings = Settings()
