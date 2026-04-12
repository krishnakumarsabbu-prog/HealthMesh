# HealthMesh — Comprehensive Project Overview

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Core Features](#3-core-features)
4. [API Documentation](#4-api-documentation)
5. [Data Models](#5-data-models)
6. [User Workflows](#6-user-workflows)
7. [Technical Stack](#7-technical-stack)
8. [Setup Instructions](#8-setup-instructions)
9. [Known Limitations](#9-known-limitations)

---

## 1. Project Summary

**HealthMesh** is an enterprise-grade application health intelligence platform that provides unified, real-time visibility into the operational health of applications across an organization. It enables engineering and operations teams to monitor application performance, manage incidents, track SLA compliance, and gain AI-powered insights — all from a single portal.

The platform supports a **multi-tenant, hierarchically scoped** architecture: organizations are structured as Enterprise → Lines of Business (LOBs) → Teams → Projects → Applications. Each user's view is automatically scoped to their position in this hierarchy, ensuring teams only see what they are permitted to access.

**Primary use cases:**
- Enterprise-wide application health dashboards for executive stakeholders
- Per-LOB project and application monitoring for LOB administrators
- Day-to-day incident management and alerting for engineering teams
- Dynamic connector configuration for ingesting health signals from external monitoring tools (Datadog, Prometheus, Splunk, AppDynamics, etc.)
- AI-generated root-cause analysis and trend insights

---

## 2. Architecture Overview

### High-Level System Design

```mermaid
graph TB
    subgraph Frontend ["Frontend (React + Vite)"]
        UI[React SPA]
        AuthCtx[AuthContext]
        AppCtx[AppContext]
        Router[React Router v6]
    end

    subgraph Backend ["Backend (FastAPI)"]
        API[REST API Layer]
        Auth[JWT Auth Middleware]
        RBAC[RBAC / Scope Filter]
        Services[Service Layer]
        Jobs[Background Jobs]
        ConnReg[Connector Registry]
    end

    subgraph Database ["Database (SQLite / PostgreSQL)"]
        OrgTables[(Organization Tables)]
        AppTables[(Application Tables)]
        HealthTables[(Health & Metrics)]
        ConnTables[(Connector Tables)]
        SettingsTables[(Settings & Audit)]
    end

    subgraph Connectors ["External Monitoring Tools"]
        DD[Datadog]
        PROM[Prometheus]
        SPLUNK[Splunk]
        APPD[AppDynamics]
        LM[LogicMonitor]
        CustomAPI[Custom API]
    end

    UI --> Router
    Router --> AuthCtx
    UI --> API
    API --> Auth
    Auth --> RBAC
    RBAC --> Services
    Services --> Database
    Jobs --> Services
    ConnReg --> Connectors
    Services --> ConnReg
```

### Organizational Hierarchy

```mermaid
graph TD
    Enterprise["Enterprise (Platform)"]
    Enterprise --> LOB1[LOB: Digital Banking]
    Enterprise --> LOB2[LOB: Retail Operations]
    Enterprise --> LOB3[LOB: Risk & Compliance]

    LOB1 --> Team1[Team: Payments]
    LOB1 --> Team2[Team: Identity]

    Team1 --> Proj1[Project: Core Payments v2]
    Team1 --> Proj2[Project: Fraud Detection]

    Proj1 --> App1[App: Payment Gateway]
    Proj1 --> App2[App: Settlement Service]
    Proj2 --> App3[App: Fraud Scoring API]
```

### Request Flow

```mermaid
sequenceDiagram
    participant Browser
    participant React SPA
    participant FastAPI
    participant JWT Middleware
    participant RBAC Scope Filter
    participant Service Layer
    participant Database

    Browser->>React SPA: User navigates to page
    React SPA->>FastAPI: GET /api/apps (Bearer token)
    FastAPI->>JWT Middleware: Validate token
    JWT Middleware->>RBAC Scope Filter: get_scoped_app_ids(user)
    RBAC Scope Filter->>Database: Query LOB/team/project associations
    Database-->>RBAC Scope Filter: Scoped app ID list
    RBAC Scope Filter-->>Service Layer: Filtered query
    Service Layer->>Database: Query with app_id filter
    Database-->>Service Layer: Results
    Service Layer-->>FastAPI: Serialized response
    FastAPI-->>React SPA: JSON
    React SPA-->>Browser: Rendered UI
```

---

## 3. Core Features

### 3.1 Role-Based Access Control (RBAC)

Four roles with hierarchical permission levels:

| Role | Level | Scope | Capabilities |
|------|-------|-------|-------------|
| `LOB_ADMIN` | 4 | Their assigned LOB (or all if unscoped) | Full access to all apps, teams, projects, and connectors within their LOB |
| `TEAM_ADMIN` | 3 | Their assigned team | All apps and projects within their team |
| `PROJECT_ADMIN` | 2 | Their assigned project | Apps within their project; limited configuration |
| `USER` | 1 | Their assigned project | Read-only access to their project's apps |

Every API endpoint applies `get_scoped_app_ids()` — a function that translates a user's role and organizational assignment into a filtered list of application IDs. All queries are automatically restricted to this scope.

### 3.2 Application Catalog

A searchable, filterable list of all applications visible to the logged-in user. Each card shows:
- Health score (0–100), status badge (healthy/degraded/critical)
- Criticality tier (P0–P3), environment, owner team
- Active incident count, connector count, dependency count
- 30-day health trend sparkline

Filters: environment, criticality, status, team, free-text search.

### 3.3 Application 360° View

A 12-tab deep-dive view for any individual application:

| Tab | Content |
|-----|---------|
| **Overview** | Health score history, latency/throughput/error-rate charts (24h) |
| **Signals** | Real-time metrics from all connected monitoring sources |
| **Transactions** | Top endpoints by RPM, P99 latency, error rate, Apdex score |
| **Logs** | Log pattern analysis: ERROR/WARN/INFO counts, first/last seen |
| **Infrastructure** | Kubernetes pod status: CPU%, memory%, restart count, age |
| **Dependencies** | Upstream/downstream service dependency health |
| **APIs** | API endpoint inventory: method, path, RPM, latency, auth type |
| **Incidents** | Incident history with AI root-cause analysis and timeline |
| **Health Rules** | Active health rules assigned to this application |
| **Connectors** | Assigned monitoring connectors and their poll status |
| **Configuration** | Runtime, platform, environment, health weight settings, thresholds |
| **AI Summary** | AI-generated insights, anomaly detections, recommendations |

### 3.4 Connector Hub

A marketplace-style interface for managing health monitoring connectors.

**Supported connector types:**
- **Datadog** — APM, Metrics, Logs, Synthetics, Alerts
- **Prometheus** — Metrics scraping
- **Splunk** — Log aggregation and search
- **AppDynamics** — Application performance monitoring
- **LogicMonitor** — Infrastructure and network monitoring
- **Database Monitor** — Database health polling
- **Synthetic Health** — Synthetic availability checks
- **Custom API** — Generic HTTP-based connector

Each connector follows a **plugin architecture** using `BaseConnector` (abstract base class) and `ConnectorRegistry` (auto-registration on import). Connectors expose: `validate_config()`, `test_connection()`, `list_capabilities()`, and `execute_metric()`.

**LOB Admins can:**
- Browse the connector template marketplace
- Add/configure new connector instances with environment-specific credentials
- Test connections before saving
- Assign connectors to specific applications with configurable poll intervals
- Remove connector assignments

### 3.5 Incident & Alert Management

- View active, acknowledged, and resolved incidents across all scoped applications
- Filter by severity (critical/warning/info) and status
- Update incident status and assignee inline
- View AI-generated root cause (`ai_cause` field) and affected dependencies
- Full timeline of incident events
- Alert list with firing/resolved status; acknowledge or resolve alerts

### 3.6 Dependency Map

Interactive visual graph showing service-to-service dependencies across the platform:
- Nodes: services, databases, queues, external APIs
- Edges: connection health status, latency, labels
- Node coordinates stored in the database enabling a reproducible layout
- Status-colored nodes (healthy = green, degraded = yellow, critical = red)

### 3.7 AI Insights

Cross-application AI-generated intelligence:
- **Insight types:** anomaly, trend, recommendation, capacity, root-cause
- **Priority levels:** high, medium, low
- **Confidence score** per insight (0.0–1.0)
- Fields: title, description, impact, recommendation, supporting signals, what_changed
- Filterable by priority and insight type
- Scoped to the user's accessible application set

### 3.8 Historical Trends

Long-term trend analysis with configurable period (daily/weekly/monthly):
- Health score trend line
- Availability percentage over time
- Incident count trend
- Latency trend
- Error rate trend
- MTTR (Mean Time to Resolve) and MTTD (Mean Time to Detect) tracking
- Team-level and environment-level trend comparison
- Summary statistics: avg availability, incident reduction %, avg latency delta

### 3.9 Health Rules Engine

Configurable threshold-based health rules:
- Rule conditions: metric + operator (`>`, `<`, `>=`, `<=`, `==`) + threshold
- Severity levels: critical, warning, info
- Scope: global (`all`) or specific apps
- Rules can be individually enabled/disabled per application with custom threshold overrides
- Trigger count and last-triggered timestamp tracked per rule

### 3.10 Teams & Ownership

- Team directory with health score, incident count, tier classification
- Team member roster: name, role, email, on-call status
- Per-team application inventory
- Slack channel reference per team

### 3.11 Executive Overview Dashboard

Role-scoped KPI summary for the logged-in user:
- Overall health score, total apps, active incidents, active alerts
- Top-impacted applications list
- 24-hour health trend chart
- Health heatmap across teams/applications
- Dashboard snapshots for historical comparison

### 3.12 Settings & Administration

Sub-pages under the Settings hub:

| Page | Functionality |
|------|--------------|
| **Branding & Workspace** | Organizational name, logo, color theme |
| **Notification Preferences** | Alert delivery channels and thresholds |
| **SLA Settings** | Per-app SLA target %, current %, error budget remaining, period |
| **Maintenance Windows** | Schedule, list, and track planned maintenance with affected app list |
| **Roles & Permissions** | User role management UI (read-only view currently) |
| **Audit Logs** | Timestamped log of all user actions on resources |
| **System Status** | Live system health: DB connection, app/incident/connector counts |

### 3.13 Onboarding Studio

Step-by-step wizard to onboard a new application:
- Define application metadata (name, type, environment, team)
- Configure connectors
- Preview calculated health score
- Review summary before committing

### 3.14 Authentication

- Email + password login
- JWT Bearer tokens (24-hour expiry)
- Token stored in `localStorage`; auto-refreshed on `/api/auth/me` on page load
- Protected routes redirect unauthenticated users to `/login`
- Inactive accounts rejected at login

---

## 4. API Documentation

Base URL: `http://localhost:8000`

Interactive docs: `GET /docs` (Swagger UI), `GET /redoc` (ReDoc)

All protected endpoints require: `Authorization: Bearer <token>`

---

### 4.1 Authentication

#### `POST /api/auth/login`

Login with email and password.

**Request:**
```json
{
  "email": "admin@healthmesh.io",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Enterprise Admin",
    "email": "admin@healthmesh.io",
    "role_id": "LOB_ADMIN",
    "role_name": "LOB Admin",
    "lob_id": null,
    "lob_name": null,
    "team_id": null,
    "team_name": null,
    "project_id": null,
    "project_name": null,
    "is_active": true
  }
}
```

#### `GET /api/auth/me`

Returns the current authenticated user.

**Response (200):** Same structure as `user` in login response.

---

### 4.2 Applications

#### `GET /api/apps`

List all applications accessible to the authenticated user (scoped by role).

**Response (200):**
```json
[
  {
    "id": "app-payments-gateway",
    "name": "Payment Gateway",
    "description": "Core payment processing service",
    "team_id": "team-payments",
    "environment": "Production",
    "status": "healthy",
    "criticality": "P0",
    "health_score": 94.5,
    "uptime": 99.97,
    "latency_p99": 142.0,
    "rpm": 8420.0,
    "app_type": "API",
    "runtime": "Java",
    "version": "3.2.1",
    "platform": "Kubernetes",
    "tags": ["payments", "critical"],
    "incident_count": 0,
    "dependency_count": 6,
    "connector_count": 3,
    "trend": [94.1, 94.8, 95.2, 94.5],
    "owner_name": "Payments Team",
    "project_id": "proj-core-payments"
  }
]
```

#### `GET /api/apps/{app_id}`

Get a single application by ID.

#### `GET /api/apps/{app_id}/overview`

Get health overview with time-series charts.

**Response includes:**
- `app` — application details
- `health_history` — 29-point daily health score array
- `latency_24h` — 48 x 30-minute P50/P95/P99 latency data points
- `throughput_24h` — 48 x 30-minute RPM data points
- `error_rate_24h` — 48 x 30-minute error rate data points

#### `GET /api/apps/{app_id}/signals`

Metrics signals from all monitoring sources. Returns array of:
```json
{
  "id": 1,
  "app_id": "app-payments-gateway",
  "category": "APM",
  "name": "P99 Latency",
  "value": "142",
  "unit": "ms",
  "status": "healthy",
  "trend": "stable",
  "delta": "+2ms",
  "source": "Datadog"
}
```

#### `GET /api/apps/{app_id}/transactions`

Top transactions with RPM, latency, error rate, and Apdex.

#### `GET /api/apps/{app_id}/logs`

Log pattern analysis by level (ERROR/WARN/INFO).

#### `GET /api/apps/{app_id}/infra`

Kubernetes pod listing with CPU/memory/restart status.

#### `GET /api/apps/{app_id}/apis`

API endpoint inventory.

#### `GET /api/apps/{app_id}/dependencies`

Upstream/downstream dependency health.

#### `GET /api/apps/{app_id}/incidents`

Incident history for this application.

#### `GET /api/apps/{app_id}/rules`

Health rules applied to this application.

#### `GET /api/apps/{app_id}/ai-summary`

AI-generated insights for this application.

#### `GET /api/apps/{app_id}/configuration`

App configuration: runtime, platform, connector list, health weights, thresholds.

#### `GET /api/apps/{app_id}/health-history`

29-day health score history.

#### `POST /api/apps`

Create a new application.

**Request:**
```json
{
  "id": "app-new-service",
  "name": "New Service",
  "team_id": "team-payments",
  "environment": "Production",
  "criticality": "P1",
  "app_type": "Service"
}
```

#### `PUT /api/apps/{app_id}`

Update application fields (partial update via dict).

#### `DELETE /api/apps/{app_id}`

Delete an application.

#### `GET /api/apps/{app_id}/connectors`

List connector instances assigned to this application.

#### `POST /api/apps/{app_id}/connectors`

Assign a connector instance to this application.

**Request:**
```json
{
  "connector_instance_id": "inst-datadog-prod",
  "poll_interval_seconds": 60
}
```

#### `DELETE /api/apps/{app_id}/connectors/{connector_instance_id}`

Remove a connector assignment from this application.

#### `POST /api/apps/{app_id}/health/check`

Trigger an immediate health check across all assigned connectors.

#### `GET /api/apps/{app_id}/health/results`

Get latest health check poll results per connector.

---

### 4.3 Connectors

#### `GET /api/connectors/templates`

List all available connector templates (Datadog, Prometheus, etc.)

**Response:**
```json
[
  {
    "id": "datadog",
    "name": "Datadog",
    "category": "APM",
    "description": "Full-stack observability with APM, logs, and synthetics",
    "logo": "https://...",
    "color": "#632CA6",
    "version": "v2",
    "fields": [
      {"key": "api_key", "label": "API Key", "type": "secret", "required": true},
      {"key": "app_key", "label": "Application Key", "type": "secret", "required": true},
      {"key": "site", "label": "Site", "type": "select", "options": ["datadoghq.com", "datadoghq.eu"]}
    ],
    "capabilities": ["apm", "metrics", "logs", "synthetics", "alerts"],
    "popular": true
  }
]
```

#### `GET /api/connectors/instances`

List all configured connector instances.

#### `POST /api/connectors/instances`

Create a new connector instance.

**Request:**
```json
{
  "template_id": "datadog",
  "name": "Datadog Production",
  "environment": "Production",
  "config": {
    "api_key": "dd-api-key-here",
    "app_key": "dd-app-key-here",
    "site": "datadoghq.com"
  }
}
```

#### `PUT /api/connectors/instances/{instance_id}`

Update a connector instance.

#### `DELETE /api/connectors/instances/{instance_id}`

Delete a connector instance.

#### `POST /api/connectors/test`

Test a connector configuration before saving.

**Request:**
```json
{
  "template_id": "prometheus",
  "config": {
    "endpoint": "http://prometheus.internal:9090",
    "query": "up"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connection established",
  "latency_ms": 45
}
```

#### `GET /api/connectors/health`

Summary of all connector instance health percentages.

#### `GET /api/connectors/{connector_id}/capabilities`

List metric capabilities available from a connector instance.

#### `GET /api/connectors/{connector_id}/usage`

Applications using a given connector instance.

---

### 4.4 Dashboard

#### `GET /api/dashboard/overview`

Full dashboard payload for the user's scope.

**Response:**
```json
{
  "health_score": 88.4,
  "total_apps": 42,
  "healthy_apps": 34,
  "degraded_apps": 6,
  "critical_apps": 2,
  "active_incidents": 4,
  "active_alerts": 11,
  "timeline": [...]
}
```

#### `GET /api/dashboard/summary`

Compact KPI summary.

#### `GET /api/dashboard/top-impacted?limit=6`

Top applications with lowest health scores.

#### `GET /api/dashboard/health-heatmap`

Grid-format health data for heatmap visualization.

#### `GET /api/dashboard/trends`

24-hour health score trend for the dashboard chart.

---

### 4.5 Incidents & Alerts

#### `GET /api/incidents?status=active`

List incidents. Optional `status` filter: `active`, `acknowledged`, `resolved`.

**Response item:**
```json
{
  "id": "inc-001",
  "app_id": "app-fraud-api",
  "app_name": "Fraud Scoring API",
  "title": "P99 latency spike > 2000ms",
  "severity": "critical",
  "status": "active",
  "duration": "23m",
  "assignee": "Sarah Chen",
  "ai_cause": "Upstream Redis cluster experiencing high memory pressure causing cache misses",
  "health_impact": "Health score dropped from 91 to 43",
  "affected_deps": ["Redis Cluster", "Feature Store"],
  "timeline": [
    {"time": "14:02", "event": "Latency threshold breached"},
    {"time": "14:05", "event": "Incident created automatically"}
  ],
  "started_at": "2024-11-12T14:02:00Z",
  "resolved_at": null
}
```

#### `GET /api/incidents/{incident_id}`

Get a single incident.

#### `PUT /api/incidents/{incident_id}`

Update incident status or assignee.

**Request:**
```json
{
  "status": "acknowledged",
  "assignee": "Mike Torres"
}
```

#### `GET /api/alerts?status=firing`

List alerts. Optional `status` filter: `firing`, `resolved`.

#### `PUT /api/alerts/{alert_id}`

Update alert status.

---

### 4.6 Health Rules

#### `GET /api/rules?enabled_only=true`

List all health rules.

#### `POST /api/rules`

Create a new health rule.

**Request:**
```json
{
  "id": "rule-latency-p99",
  "name": "High P99 Latency",
  "metric": "latency_p99",
  "operator": ">",
  "threshold": 500,
  "severity": "warning",
  "description": "Alert when P99 exceeds 500ms",
  "scope": "all",
  "enabled": true
}
```

#### `PUT /api/rules/{rule_id}`

Update a health rule.

#### `DELETE /api/rules/{rule_id}`

Delete a health rule.

---

### 4.7 Tenant Organization

#### `GET /api/lobs`

List LOBs accessible to the user (LOB_ADMIN sees only their own; others see all).

#### `GET /api/teams`

List org teams scoped to the user's role.

#### `GET /api/projects`

List projects scoped to the user's role.

---

### 4.8 AI Insights

#### `GET /api/ai/insights?priority=high&insight_type=anomaly`

List all AI insights for accessible applications.

#### `GET /api/ai/insights/{app_id}`

Get insights for a specific application.

---

### 4.9 Historical Trends

#### `GET /api/trends/health?period=monthly`

Health score trend data points.

#### `GET /api/trends/incidents?period=monthly`

Incident count trend.

#### `GET /api/trends/latency?period=monthly`

Latency trend.

#### `GET /api/trends/errors?period=monthly`

Error rate trend.

#### `GET /api/trends/summary`

Aggregated trend statistics: avg availability, MTTR improvement, incident reduction %, team comparisons, environment comparisons.

---

### 4.10 Teams

#### `GET /api/teams`

List all teams with members and application names.

#### `GET /api/teams/{team_id}`

Get a single team with member roster.

#### `GET /api/environments`

List environments with health scores and app counts.

---

### 4.11 Settings

#### `GET /api/maintenance?status=scheduled`

List maintenance windows.

#### `POST /api/maintenance`

Create a maintenance window.

**Request:**
```json
{
  "id": "mw-2024-11-20",
  "title": "Database upgrade",
  "description": "PostgreSQL major version upgrade",
  "start_time": "2024-11-20T22:00:00Z",
  "end_time": "2024-11-21T02:00:00Z",
  "affected_apps": ["app-payments-gateway", "app-user-service"],
  "created_by": "ops@company.com"
}
```

#### `GET /api/sla`

List all SLA settings with current compliance percentages.

#### `GET /api/audit?limit=50`

Retrieve the most recent audit log entries.

---

### 4.12 Admin

#### `POST /api/admin/simulate-refresh`

Trigger background jobs: health score recalculation, alert grouping, dashboard snapshot.

#### `POST /api/admin/recalculate-health-scores`

Synchronously recalculate health scores for all applications.

#### `GET /api/admin/system-status`

System health: DB connection status, entity counts.

---

### 4.13 Utility

#### `GET /health`

Liveness check. Returns `{"status": "ok", "version": "1.0.0"}`.

#### `GET /api/health`

API health check.

#### `GET /api/dependencies`

Full dependency graph (nodes + edges).

---

## 5. Data Models

### Entity-Relationship Overview

```mermaid
erDiagram
    Lob ||--o{ OrgTeam : "has many"
    OrgTeam ||--o{ Project : "has many"
    Project ||--o{ Application : "has many"
    Application ||--o{ AppSignal : "has many"
    Application ||--o{ AppTransaction : "has many"
    Application ||--o{ AppLogPattern : "has many"
    Application ||--o{ AppInfraPod : "has many"
    Application ||--o{ AppDependency : "has many"
    Application ||--o{ AppEndpoint : "has many"
    Application ||--o{ AppHealthScore : "has many"
    Application ||--o{ Incident : "has many"
    Application ||--o{ AiInsight : "has many"
    Application ||--o{ AppHealthRule : "has many"
    Application ||--o{ AppConnectorAssignment : "has many"
    HealthRule ||--o{ AppHealthRule : "assigned via"
    ConnectorTemplate ||--o{ ConnectorInstance : "instantiated as"
    ConnectorInstance ||--o{ AppConnectorAssignment : "assigned via"
    AppConnectorAssignment ||--o{ AppHealthPollResult : "produces"
    DependencyNode ||--o{ DependencyEdge : "source"
    DependencyNode ||--o{ DependencyEdge : "target"
    User }o--|| Role : "has"
    User }o--o| Lob : "scoped to"
    User }o--o| OrgTeam : "scoped to"
    User }o--o| Project : "scoped to"
```

### Key Table Definitions

#### `roles`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | `LOB_ADMIN`, `TEAM_ADMIN`, `PROJECT_ADMIN`, `USER` |
| name | TEXT | Display name |
| description | TEXT | Role description |

#### `lobs`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | e.g., `lob-digital-banking` |
| name | TEXT | e.g., `Digital Banking` |
| description | TEXT | LOB description |

#### `org_teams`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | e.g., `team-payments` |
| name | TEXT | Team name |
| lob_id | TEXT FK → lobs | Parent LOB |

#### `projects`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | e.g., `proj-core-payments` |
| name | TEXT | Project name |
| team_id | TEXT FK → org_teams | Parent team |

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| name | TEXT | Full name |
| email | TEXT UNIQUE | Login email |
| password_hash | TEXT | BCrypt hash |
| role_id | TEXT FK → roles | Permission role |
| lob_id | TEXT FK → lobs | Optional LOB scope |
| team_id | TEXT FK → org_teams | Optional team scope |
| project_id | TEXT FK → projects | Optional project scope |
| is_active | BOOLEAN | Account active flag |

#### `applications`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Unique identifier |
| name | TEXT | Application name |
| team_id | TEXT FK → teams | Owning team |
| project_id | TEXT | Associated project |
| environment | TEXT | Production/Staging/Dev/QA |
| status | TEXT | healthy/degraded/critical |
| criticality | TEXT | P0/P1/P2/P3 |
| health_score | REAL | 0–100 score |
| uptime | REAL | Uptime percentage |
| latency_p99 | REAL | P99 latency in ms |
| rpm | REAL | Requests per minute |
| app_type | TEXT | Service/API/Database/etc |
| runtime | TEXT | Java/Python/Go/Node/etc |
| version | TEXT | Deployed version |
| platform | TEXT | Kubernetes/Docker/VM/etc |
| tags | JSON | Array of tag strings |
| incident_count | INTEGER | Active incidents |
| trend | JSON | Health score time series |
| owner_name | TEXT | Human-readable owner |

#### `connector_templates`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | e.g., `datadog`, `prometheus` |
| name | TEXT | Display name |
| category | TEXT | APM/Log/Metric/Infra |
| fields | JSON | Config field definitions |
| capabilities | JSON | Available metric types |
| popular | BOOLEAN | Featured in marketplace |

#### `connector_instances`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Instance ID |
| template_id | TEXT FK → connector_templates | Template used |
| name | TEXT | User-defined name |
| environment | TEXT | Target environment |
| status | TEXT | healthy/degraded/critical |
| health_pct | REAL | Overall connector health |
| app_count | INTEGER | Apps using this instance |
| config | JSON | Encrypted configuration |

#### `health_rules`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Rule identifier |
| metric | TEXT | Metric name to evaluate |
| operator | TEXT | `>`, `<`, `>=`, `<=`, `==` |
| threshold | REAL | Trigger threshold value |
| severity | TEXT | critical/warning/info |
| enabled | BOOLEAN | Active flag |
| scope | TEXT | `all` or `specific` |
| trigger_count | INTEGER | How many times triggered |

#### `incidents`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Incident identifier |
| app_id | TEXT FK → applications | Affected application |
| severity | TEXT | critical/warning/info |
| status | TEXT | active/acknowledged/resolved |
| ai_cause | TEXT | AI-generated root cause |
| affected_deps | JSON | Dependency names involved |
| timeline | JSON | Array of timestamped events |
| started_at | TEXT | ISO 8601 start time |
| resolved_at | TEXT | ISO 8601 resolution time |

#### `audit_logs`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| user_name | TEXT | Acting user name |
| user_email | TEXT | Acting user email |
| action | TEXT | create/update/delete/login |
| resource_type | TEXT | application/incident/connector |
| resource_id | TEXT | Resource identifier |
| details | TEXT | Human-readable summary |
| ip_address | TEXT | Client IP |
| timestamp | TEXT | ISO 8601 timestamp |

---

## 6. User Workflows

### 6.1 Enterprise Admin: Morning Health Review

```
1. Log in → routed to Executive Overview dashboard
2. See enterprise-wide KPI strip: total apps, health score, active incidents
3. Review top-impacted applications panel (lowest health scores)
4. Click into a degraded application → Application 360° view opens
5. Check the Overview tab for latency and error rate spikes
6. Navigate to Incidents tab → review AI root-cause analysis
7. Assign incident to on-call engineer
8. Review AI Insights page for cross-application trend anomalies
9. Check Historical Trends for MTTR and incident reduction over last 30 days
```

### 6.2 LOB Admin: Adding a New Project & Application

```
1. Log in → Executive Overview shows only their LOB's applications
2. Navigate to Connector Hub → browse available connector templates
3. Click "Add Connector" → Datadog → fill in API key, app key, site
4. Click "Test Connection" → success
5. Save connector instance as "Datadog Production"
6. Navigate to Onboarding Studio
7. Step 1: Enter application name, type, environment, team assignment
8. Step 2: Assign "Datadog Production" connector → configure poll interval (60s)
9. Step 3: Preview calculated health score
10. Step 4: Review summary → confirm
11. New application appears in Application Catalog scoped to their LOB
```

### 6.3 Team Member: Investigating an Alert

```
1. Log in → sees only their project's applications
2. Notifications show a firing alert: "Error rate > 1% on Payment Gateway"
3. Navigate to Incidents & Alerts → filter by "firing"
4. Click alert → see threshold, current value, fired timestamp
5. Navigate to Application Catalog → open Payment Gateway
6. Application 360° → Signals tab → find error rate metric rising
7. Logs tab → see ERROR pattern: "NullPointerException in PaymentProcessor"
8. Infrastructure tab → one pod showing 3 restarts in last hour
9. Update incident status to "acknowledged"
10. Post findings in team Slack channel (visible in team settings)
```

### 6.4 LOB Admin: Managing Connector Health

```
1. Navigate to Connector Hub
2. Review connected instances list with health percentages
3. Identify a degraded Prometheus instance (health 67%)
4. Click connector card → Connector Drawer opens
5. Review assigned applications and last sync time
6. Click "Test Connection" → connection timeout error
7. Edit configuration → update endpoint URL
8. Re-test → success
9. Connector health recovers within next poll cycle
```

### 6.5 SLA Compliance Review

```
1. Navigate to Settings → SLA Settings
2. View all configured SLAs with target vs. current %
3. Identify application with error budget at 12% remaining
4. Navigate to that application's 360° view → AI Summary tab
5. Review recommendations for error reduction
6. Navigate to Maintenance Windows → schedule downtime for remediation
```

---

## 7. Technical Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.5.3 | Type safety |
| React Router | 6.26.1 | Client-side routing |
| Vite | 5.4.2 | Build tool and dev server |
| Tailwind CSS | 3.4.10 | Utility-first styling |
| Radix UI | Various | Accessible component primitives (Dialog, Tabs, Select, etc.) |
| Recharts | 2.12.7 | Chart and data visualization library |
| Framer Motion | 11.3.19 | Animation library |
| Lucide React | 0.439.0 | Icon library |
| cmdk | 1.0.0 | Command palette (CMD+K) |
| class-variance-authority | 0.7.0 | Component variant management |
| clsx + tailwind-merge | latest | Conditional class utilities |
| @supabase/supabase-js | 2.45.0 | Supabase client (configured, available) |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.111.0 | Web framework |
| Uvicorn | 0.30.1 | ASGI server |
| SQLAlchemy | 2.0.31 | ORM |
| Pydantic | 2.7.4 | Request/response validation |
| pydantic-settings | 2.3.4 | Configuration management |
| APScheduler | 3.10.4 | Background job scheduling |
| python-jose | 3.3.0 | JWT token creation/validation |
| bcrypt | 4.2.1 | Password hashing |
| httpx | 0.27.0 | HTTP client for connector calls |
| python-multipart | 0.0.9 | Form data parsing |

### Database

| Technology | Usage |
|-----------|-------|
| SQLite | Default development database (`backend/healthmesh.db`) |
| PostgreSQL / Supabase | Production-ready target (Supabase credentials in `.env`) |
| SQLAlchemy ORM | Abstraction layer (DB-agnostic queries) |

### Infrastructure & Tooling

| Tool | Purpose |
|------|---------|
| Supabase | Cloud Postgres database + auth (available via env) |
| ESLint | TypeScript/React linting |
| PostCSS + Autoprefixer | CSS processing |
| tailwindcss-animate | Animation utilities |

---

## 8. Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **pip** or a virtual environment manager (venv, conda)

---

### 8.1 Frontend Setup

```bash
# From project root
npm install

# Configure environment (optional — defaults to localhost:8000 backend)
# Create .env.local if you need a custom API URL:
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Start development server (port 5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

### 8.2 Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate.bat       # Windows

# Install dependencies
pip install -r requirements.txt

# Start the API server (auto-creates DB and seeds data on first run)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On first startup:
- All 31 database tables are created automatically
- Sample data is seeded (applications, teams, connectors, incidents, AI insights, etc.)
- Demo user accounts are created (see seed data for credentials)

---

### 8.3 Database Configuration

**Default (SQLite — development):**

No configuration needed. Database file created at `backend/healthmesh.db`.

**PostgreSQL / Supabase (recommended for production):**

Set the `DATABASE_URL` environment variable before starting the backend:

```bash
# Option 1: Environment variable
export DATABASE_URL="postgresql://user:password@host:5432/healthmesh"
uvicorn app.main:app --reload

# Option 2: .env file in backend/
echo 'DATABASE_URL=postgresql://user:password@host:5432/healthmesh' >> backend/.env
```

Install the PostgreSQL driver:

```bash
pip install psycopg2-binary
```

---

### 8.4 Environment Variables

**Frontend** (`.env` or `.env.local` in project root):

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_SUPABASE_URL` | — | Supabase project URL (if using Supabase auth) |
| `VITE_SUPABASE_ANON_KEY` | — | Supabase anonymous key |

**Backend** (environment variables or `backend/.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./healthmesh.db` | Database connection string |
| `DEBUG` | `true` | Debug mode |

---

### 8.5 CORS Configuration

The backend allows connections from:
- `http://localhost:5173` (Vite default)
- `http://localhost:5174` (Vite alternative)
- `http://localhost:3000`
- `http://127.0.0.1:5173`

To add additional origins, modify `cors_origins` in `backend/app/core/config.py`.

---

### 8.6 Default User Accounts

After seeding, the following demo accounts are available (passwords in `backend/app/seed/identity_data.py`):

| Role | Email | LOB/Team/Project Scope |
|------|-------|----------------------|
| LOB_ADMIN (enterprise) | admin@healthmesh.io | No scope (sees all) |
| LOB_ADMIN | lob.admin@healthmesh.io | Assigned LOB |
| TEAM_ADMIN | team.admin@healthmesh.io | Assigned team |
| PROJECT_ADMIN | proj.admin@healthmesh.io | Assigned project |
| USER | user@healthmesh.io | Assigned project |

---

## 9. Known Limitations

### 9.1 Database

- **SQLite not suitable for production.** SQLite has limited concurrency (single-writer), no horizontal scaling, and limited data type support. Switch to PostgreSQL or Supabase for production deployments.
- **No database migrations tool.** Schema changes require manual `ALTER TABLE` or dropping/recreating the database file. Consider adding Alembic for versioned migrations.
- **No connection pooling.** SQLite session management is synchronous and not pool-managed. PostgreSQL deployments should configure `pool_size` and `max_overflow` in `session.py`.

### 9.2 Authentication & Security

- **JWT secret is hardcoded** in `backend/app/core/security.py` for development. Must be replaced with a securely generated `SECRET_KEY` environment variable in production.
- **Token expiry is 24 hours** with no refresh token mechanism. Users must re-login after expiry.
- **No rate limiting** on login endpoint — brute-force protection not implemented.
- **No email verification** for user registration (registration flow is admin-initiated via seed data only).
- **Connector credentials stored as plain JSON** in `connector_instances.config`. Should be encrypted at rest in production.

### 9.3 Connectors

- **All connectors return synthetic/mock data.** The connector implementations (`datadog.py`, `prometheus.py`, etc.) are architectural stubs — `execute_metric()` returns generated data rather than real API calls. Live data requires implementing actual HTTP calls with real credentials.
- **No connector credential validation on save.** `validate_config()` is defined in the abstract base but not consistently enforced before persisting instances.

### 9.4 Real-Time Monitoring

- **No WebSocket or server-sent events.** All data is fetched via polling on page load. The UI does not auto-refresh; users must reload to see updated health scores.
- **Background jobs (APScheduler) are in-process.** Health score jobs, alert grouping, and snapshot jobs run in the same process as the API server. For production, consider Celery + Redis or a dedicated job queue.

### 9.5 Frontend

- **No frontend role-based navigation filtering.** The sidebar shows all menu items regardless of the logged-in user's role. Role-scoped menus are not yet implemented on the frontend.
- **No route-level role guards.** Any authenticated user can navigate to any route (e.g., `/roles`, `/audit`) regardless of permission level. Backend APIs enforce scoping, but the UI does not redirect unauthorized users.
- **Large JavaScript bundle.** All pages are bundled into a single chunk. Implementing Vite's `manualChunks` or `React.lazy()` for route-level code splitting would significantly improve initial load time.

### 9.6 Features Pending Full Implementation

- **AI Insights generation** — Data is seeded from static fixtures. A real AI/ML pipeline or LLM integration for generating insights is not implemented.
- **User management UI** — The Roles & Permissions page is a read-only display. Creating, editing, and deactivating users via the UI is not yet functional.
- **Project management UI** — Creating and managing projects within LOBs from the frontend is not yet available.
- **Notification delivery** — The notification preferences UI exists but no email/Slack/PagerDuty integration is wired.
- **Audit log writes** — The audit log data model and read endpoint exist, but most create/update/delete operations do not yet write audit entries.
- **SLA breach alerting** — SLA settings are configurable but breach notifications are not triggered automatically.
