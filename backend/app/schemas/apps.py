from pydantic import BaseModel
from typing import Optional


class TeamMemberOut(BaseModel):
    id: int
    name: str
    initials: str
    role: str
    email: str
    on_call: bool

    class Config:
        from_attributes = True


class TeamOut(BaseModel):
    id: str
    name: str
    tier: int
    health_score: float
    incident_count: int
    lead_name: str
    slack_channel: str
    description: str
    members: list[TeamMemberOut] = []

    class Config:
        from_attributes = True


class EnvironmentOut(BaseModel):
    id: str
    name: str
    health_score: float
    app_count: int
    incident_count: int
    status: str

    class Config:
        from_attributes = True


class ApplicationOut(BaseModel):
    id: str
    name: str
    description: str
    team_id: str
    environment: str
    status: str
    criticality: str
    health_score: float
    uptime: float
    latency_p99: float
    rpm: float
    app_type: str
    runtime: str
    version: str
    platform: str
    tags: list
    incident_count: int
    dependency_count: int
    connector_count: int
    trend: list
    owner_name: str

    class Config:
        from_attributes = True


class ApplicationCreate(BaseModel):
    id: str
    name: str
    description: str = ""
    team_id: str
    environment: str = "Production"
    status: str = "healthy"
    criticality: str = "P1"
    health_score: float = 100.0
    uptime: float = 99.9
    latency_p99: float = 100.0
    rpm: float = 1000.0
    app_type: str = "Service"
    runtime: str = ""
    version: str = ""
    platform: str = ""
    tags: list = []
    owner_name: str = ""


class AppSignalOut(BaseModel):
    id: int
    app_id: str
    category: str
    name: str
    value: str
    unit: str
    status: str
    trend: str
    delta: str
    source: str

    class Config:
        from_attributes = True


class AppTransactionOut(BaseModel):
    id: int
    app_id: str
    endpoint: str
    rpm: float
    latency_p99: float
    error_rate: float
    apdex: float
    status: str

    class Config:
        from_attributes = True


class AppLogPatternOut(BaseModel):
    id: int
    app_id: str
    level: str
    message: str
    count: int
    first_seen: str
    last_seen: str

    class Config:
        from_attributes = True


class AppInfraPodOut(BaseModel):
    id: int
    app_id: str
    pod_name: str
    node: str
    cpu_pct: float
    mem_pct: float
    restarts: int
    age: str
    status: str

    class Config:
        from_attributes = True


class AppDependencyOut(BaseModel):
    id: int
    app_id: str
    dep_name: str
    dep_type: str
    status: str
    latency: str
    error_rate: str

    class Config:
        from_attributes = True


class AppEndpointOut(BaseModel):
    id: int
    app_id: str
    method: str
    path: str
    status: str
    rpm: float
    latency_p99: float
    error_rate: float
    version: str
    auth: str

    class Config:
        from_attributes = True


class AppHealthScoreOut(BaseModel):
    label: str
    score: float

    class Config:
        from_attributes = True


class App360Overview(BaseModel):
    app: ApplicationOut
    health_history: list[AppHealthScoreOut]
    latency_24h: list[dict]
    throughput_24h: list[dict]
    error_rate_24h: list[dict]
