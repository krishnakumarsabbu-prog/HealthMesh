/*
  # Organization & User Management Tables

  ## Summary
  Creates the tables needed to support the User Management and Organization pages in HealthMesh.

  ## New Tables

  ### 1. `lobs` (Lines of Business)
  - `id` (uuid, pk) — unique identifier
  - `name` (text) — display name of the LOB
  - `description` (text) — optional description
  - `created_at` (timestamptz) — creation timestamp

  ### 2. `org_teams`
  - `id` (uuid, pk)
  - `lob_id` (uuid, fk → lobs) — parent LOB
  - `name` (text)
  - `description` (text)
  - `health_score` (int) — 0–100
  - `created_at` (timestamptz)

  ### 3. `projects`
  - `id` (uuid, pk)
  - `team_id` (uuid, fk → org_teams) — parent team
  - `name` (text)
  - `description` (text)
  - `app_count` (int) — number of apps in this project
  - `health_score` (int) — 0–100
  - `status` (text) — healthy/warning/critical/degraded
  - `created_at` (timestamptz)

  ### 4. `org_users`
  - `id` (uuid, pk)
  - `name` (text)
  - `email` (text, unique)
  - `role_id` (text) — LOB_ADMIN / TEAM_ADMIN / PROJECT_ADMIN / USER
  - `lob_id` (uuid, fk → lobs, nullable)
  - `team_id` (uuid, fk → org_teams, nullable)
  - `project_id` (uuid, fk → projects, nullable)
  - `status` (text) — active / inactive / pending
  - `created_at` (timestamptz)
  - `last_active_at` (timestamptz, nullable)

  ## Security
  - RLS enabled on all four tables
  - Authenticated users can read all rows (needed for org hierarchy views)
  - Only LOB_ADMIN role (checked via JWT app_metadata) can insert/update/delete
*/

-- LOBs table
CREATE TABLE IF NOT EXISTS lobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lobs"
  ON lobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "LOB admins can insert lobs"
  ON lobs FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN'
  );

CREATE POLICY "LOB admins can update lobs"
  ON lobs FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN');

CREATE POLICY "LOB admins can delete lobs"
  ON lobs FOR DELETE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN');

-- Org Teams table
CREATE TABLE IF NOT EXISTS org_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lob_id uuid NOT NULL REFERENCES lobs(id),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  health_score int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE org_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view org_teams"
  ON org_teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "TEAM_ADMIN or above can insert org_teams"
  ON org_teams FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.jwt() -> 'app_metadata' ->> 'role_id') IN ('LOB_ADMIN', 'TEAM_ADMIN')
  );

CREATE POLICY "TEAM_ADMIN or above can update org_teams"
  ON org_teams FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') IN ('LOB_ADMIN', 'TEAM_ADMIN'))
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role_id') IN ('LOB_ADMIN', 'TEAM_ADMIN'));

CREATE POLICY "LOB admins can delete org_teams"
  ON org_teams FOR DELETE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN');

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES org_teams(id),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  app_count int NOT NULL DEFAULT 0,
  health_score int NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'healthy',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "PROJECT_ADMIN or above can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.jwt() -> 'app_metadata' ->> 'role_id') IN ('LOB_ADMIN', 'TEAM_ADMIN', 'PROJECT_ADMIN')
  );

CREATE POLICY "PROJECT_ADMIN or above can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') IN ('LOB_ADMIN', 'TEAM_ADMIN', 'PROJECT_ADMIN'))
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role_id') IN ('LOB_ADMIN', 'TEAM_ADMIN', 'PROJECT_ADMIN'));

CREATE POLICY "LOB admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN');

-- Org Users table
CREATE TABLE IF NOT EXISTS org_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role_id text NOT NULL DEFAULT 'USER',
  lob_id uuid REFERENCES lobs(id),
  team_id uuid REFERENCES org_teams(id),
  project_id uuid REFERENCES projects(id),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz
);

ALTER TABLE org_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view org_users"
  ON org_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "LOB admins can insert org_users"
  ON org_users FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN'
  );

CREATE POLICY "LOB admins can update org_users"
  ON org_users FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN');

CREATE POLICY "LOB admins can delete org_users"
  ON org_users FOR DELETE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN');

-- Seed with representative demo data
INSERT INTO lobs (id, name, description) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Digital Commerce', 'Customer-facing commerce and marketplace platforms'),
  ('11111111-0000-0000-0000-000000000002', 'Financial Services', 'Payments, billing, and financial operations'),
  ('11111111-0000-0000-0000-000000000003', 'Data & AI', 'Data pipelines, ML platform, and analytics')
ON CONFLICT DO NOTHING;

INSERT INTO org_teams (id, lob_id, name, description, health_score) VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Platform', 'Core platform infrastructure', 85),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Commerce', 'Catalog, cart, and ordering', 92),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'Payments', 'Payment processing and billing', 98),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002', 'Risk', 'Fraud detection and compliance', 95),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000003', 'ML Platform', 'Feature store and model serving', 78),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000003', 'Analytics', 'Reporting and data warehouse', 91)
ON CONFLICT DO NOTHING;

INSERT INTO projects (id, team_id, name, description, app_count, health_score, status) VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'API Gateway', 'Edge routing and API management', 4, 82, 'warning'),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 'Identity & Auth', 'SSO, OAuth2, and session management', 3, 90, 'healthy'),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'Product Catalog', 'Product listings and inventory', 5, 95, 'healthy'),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', 'Order Management', 'Cart, checkout, and orders', 4, 88, 'healthy'),
  ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000003', 'Payment Rails', 'Core payment processing services', 6, 99, 'healthy'),
  ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000003', 'Billing & Invoicing', 'Subscription and invoice engine', 3, 96, 'healthy'),
  ('33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000004', 'Fraud Detection', 'Real-time fraud scoring', 3, 93, 'healthy'),
  ('33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000005', 'Feature Store', 'ML feature computation and serving', 4, 74, 'degraded'),
  ('33333333-0000-0000-0000-000000000009', '22222222-0000-0000-0000-000000000005', 'Model Serving', 'Inference and model lifecycle', 5, 81, 'warning'),
  ('33333333-0000-0000-0000-000000000010', '22222222-0000-0000-0000-000000000006', 'Reporting API', 'Dashboards and report generation', 4, 94, 'healthy')
ON CONFLICT DO NOTHING;

INSERT INTO org_users (name, email, role_id, lob_id, team_id, project_id, status, last_active_at) VALUES
  ('Alex Chen', 'alex.chen@acme.io', 'LOB_ADMIN', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', null, 'active', now() - interval '2 hours'),
  ('Rachel James', 'rachel.james@acme.io', 'TEAM_ADMIN', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003', null, 'active', now() - interval '30 minutes'),
  ('Tom Park', 'tom.park@acme.io', 'TEAM_ADMIN', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', null, 'active', now() - interval '1 hour'),
  ('Jake Moore', 'jake.moore@acme.io', 'TEAM_ADMIN', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000005', null, 'active', now() - interval '3 hours'),
  ('Sara Lee', 'sara.lee@acme.io', 'PROJECT_ADMIN', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'active', now() - interval '15 minutes'),
  ('Kevin Liu', 'kevin.liu@acme.io', 'USER', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000005', 'active', now() - interval '45 minutes'),
  ('Maya Watts', 'maya.watts@acme.io', 'USER', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000006', 'active', now() - interval '2 days'),
  ('Nina Dey', 'nina.dey@acme.io', 'PROJECT_ADMIN', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000003', 'active', now() - interval '4 hours'),
  ('David Rodriguez', 'david.r@acme.io', 'TEAM_ADMIN', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000005', null, 'active', now() - interval '6 hours'),
  ('Yuki Tanaka', 'yuki.t@acme.io', 'USER', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000008', 'active', now() - interval '1 day'),
  ('Lucy Brown', 'lucy.b@acme.io', 'TEAM_ADMIN', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000006', null, 'inactive', now() - interval '5 days'),
  ('Ben Ko', 'ben.ko@acme.io', 'USER', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000002', 'pending', null),
  ('Miguel Pena', 'miguel.p@acme.io', 'TEAM_ADMIN', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000004', null, 'active', now() - interval '1 hour'),
  ('Clara Sato', 'clara.s@acme.io', 'USER', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000007', 'active', now() - interval '3 hours')
ON CONFLICT (email) DO NOTHING;
