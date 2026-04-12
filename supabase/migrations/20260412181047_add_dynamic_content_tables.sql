/*
  # Add Dynamic Content Tables

  ## Summary
  Creates tables to replace hard-coded frontend data with database-driven content.
  This migration covers connector templates, environments, available metrics, 
  health score weights, and notifications.

  ## New Tables

  ### 1. `connector_templates`
  Stores connector type definitions (Datadog, Prometheus, Splunk, etc.)
  - `id` (text, pk) — slug identifier
  - `name` (text) — display name
  - `category` (text) — APM / Logs / Infra / etc.
  - `abbr` (text) — short abbreviation
  - `icon_bg` (text) — Tailwind classes for icon display
  - `description` (text) — human-readable description
  - `display_order` (int) — ordering for UI lists

  ### 2. `environments`
  Stores environment options shown in the environment switcher
  - `id` (uuid, pk)
  - `name` (text, unique) — Production / Staging / Development / QA
  - `color_class` (text) — Tailwind color class for indicator dot
  - `display_order` (int) — ordering

  ### 3. `available_metrics`
  Stores metrics available during onboarding
  - `id` (text, pk) — metric key
  - `label` (text) — display label
  - `connector_name` (text) — associated connector name
  - `metric_type` (text) — APM / Infra / Synthetic / etc.
  - `recommended` (boolean) — whether recommended
  - `display_order` (int)

  ### 4. `health_score_weights`
  Stores default health score formula weights
  - `id` (uuid, pk)
  - `label` (text) — Latency / Errors / etc.
  - `weight` (int) — percentage weight 0-100
  - `color` (text) — hex color for visualization
  - `display_order` (int)

  ### 5. `notifications`
  Stores system notifications shown in the header bell
  - `id` (uuid, pk)
  - `type` (text) — critical / warning / healthy / info
  - `title` (text)
  - `description` (text)
  - `created_at` (timestamptz) — used for relative time display
  - `is_read` (boolean)
  - `user_id` (uuid, nullable) — null means global notification

  ## Security
  - RLS enabled on all tables
  - connector_templates, environments, available_metrics, health_score_weights: read by authenticated users
  - notifications: users read their own + global notifications
*/

-- Connector Templates table
CREATE TABLE IF NOT EXISTS connector_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT '',
  abbr text NOT NULL DEFAULT '',
  icon_bg text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE connector_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view connector_templates"
  ON connector_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "LOB admins can insert connector_templates"
  ON connector_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN'
  );

CREATE POLICY "LOB admins can update connector_templates"
  ON connector_templates FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN');

-- Environments table
CREATE TABLE IF NOT EXISTS environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color_class text NOT NULL DEFAULT 'bg-blue-500',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE environments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view environments"
  ON environments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "LOB admins can insert environments"
  ON environments FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN'
  );

CREATE POLICY "LOB admins can update environments"
  ON environments FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN');

-- Available Metrics table
CREATE TABLE IF NOT EXISTS available_metrics (
  id text PRIMARY KEY,
  label text NOT NULL,
  connector_name text NOT NULL DEFAULT '',
  metric_type text NOT NULL DEFAULT '',
  recommended boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE available_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view available_metrics"
  ON available_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "LOB admins can insert available_metrics"
  ON available_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN'
  );

CREATE POLICY "LOB admins can update available_metrics"
  ON available_metrics FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN');

-- Health Score Weights table
CREATE TABLE IF NOT EXISTS health_score_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  weight int NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#000000',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE health_score_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view health_score_weights"
  ON health_score_weights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "LOB admins can insert health_score_weights"
  ON health_score_weights FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN'
  );

CREATE POLICY "LOB admins can update health_score_weights"
  ON health_score_weights FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role_id') = 'LOB_ADMIN');

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and global notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can update own notification read status"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "LOB admins can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.jwt() -> 'app_metadata' ->> 'role_id') IN ('LOB_ADMIN', 'TEAM_ADMIN')
  );

-- Seed connector_templates
INSERT INTO connector_templates (id, name, category, abbr, icon_bg, description, display_order) VALUES
  ('datadog', 'Datadog', 'APM', 'DD', 'bg-violet-500/10 text-violet-500', 'APM, metrics, traces and logs', 1),
  ('prometheus', 'Prometheus', 'Infra', 'PR', 'bg-orange-500/10 text-orange-500', 'Open-source metrics and alerting', 2),
  ('cloudwatch', 'AWS CloudWatch', 'Cloud', 'CW', 'bg-amber-500/10 text-amber-500', 'AWS native observability', 3),
  ('splunk', 'Splunk', 'Logs', 'SP', 'bg-green-500/10 text-green-600', 'Log aggregation and search', 4),
  ('appdynamics', 'AppDynamics', 'APM', 'AD', 'bg-blue-500/10 text-blue-500', 'Business transaction monitoring', 5),
  ('grafana', 'Grafana', 'Infra', 'GF', 'bg-rose-500/10 text-rose-500', 'Dashboards and visualization', 6),
  ('dynatrace', 'Dynatrace', 'APM', 'DT', 'bg-teal-500/10 text-teal-500', 'AI-powered full-stack APM', 7),
  ('pagerduty', 'PagerDuty', 'Incident', 'PD', 'bg-emerald-500/10 text-emerald-500', 'Incident response platform', 8),
  ('kafka', 'Kafka / MQ', 'Messaging', 'KF', 'bg-slate-500/10 text-slate-500', 'Message queue monitoring', 9),
  ('database', 'Database Monitor', 'Database', 'DB', 'bg-cyan-500/10 text-cyan-500', 'SQL/NoSQL query insights', 10),
  ('synthetic', 'Synthetic Health', 'Synthetic', 'SY', 'bg-pink-500/10 text-pink-500', 'Proactive synthetic probing', 11),
  ('custom', 'Custom REST API', 'Custom', 'CR', 'bg-muted text-muted-foreground', 'Any HTTP/REST endpoint', 12)
ON CONFLICT (id) DO NOTHING;

-- Seed environments
INSERT INTO environments (name, color_class, display_order) VALUES
  ('Production', 'bg-emerald-500', 1),
  ('Staging', 'bg-amber-500', 2),
  ('Development', 'bg-blue-500', 3),
  ('QA', 'bg-blue-500', 4)
ON CONFLICT (name) DO NOTHING;

-- Seed available_metrics
INSERT INTO available_metrics (id, label, connector_name, metric_type, recommended, display_order) VALUES
  ('latency_p99', 'P99 Latency', 'Datadog', 'APM', true, 1),
  ('latency_p95', 'P95 Latency', 'Datadog', 'APM', true, 2),
  ('error_rate', 'Error Rate', 'Datadog', 'APM', true, 3),
  ('throughput', 'Throughput (RPM)', 'Datadog', 'APM', true, 4),
  ('availability', 'Availability %', 'Synthetic', 'Synthetic', true, 5),
  ('cpu_pct', 'CPU Utilization %', 'Prometheus', 'Infra', false, 6),
  ('memory_pct', 'Memory Utilization %', 'Prometheus', 'Infra', false, 7),
  ('pod_restarts', 'Pod Restarts', 'Prometheus', 'Infra', false, 8),
  ('db_conn_pool', 'DB Connection Pool', 'CloudWatch', 'Database', false, 9),
  ('incidents_open', 'Open Incidents', 'PagerDuty', 'Incident', true, 10),
  ('slo_budget', 'Error Budget Remaining', 'Datadog', 'SLO', true, 11)
ON CONFLICT (id) DO NOTHING;

-- Seed health_score_weights
INSERT INTO health_score_weights (label, weight, color, display_order) VALUES
  ('Latency', 30, '#10b981', 1),
  ('Errors', 25, '#3b82f6', 2),
  ('Availability', 25, '#f59e0b', 3),
  ('Infrastructure', 10, '#8b5cf6', 4),
  ('Incidents', 10, '#ef4444', 5)
ON CONFLICT DO NOTHING;

-- Seed demo notifications
INSERT INTO notifications (type, title, description, is_read, user_id) VALUES
  ('critical', 'payments-api latency spike', 'P99 > 2000ms for 5 minutes', false, NULL),
  ('warning', 'auth-service memory warning', 'Memory at 87% capacity', false, NULL),
  ('healthy', 'database-primary recovered', 'Incident resolved automatically', false, NULL),
  ('info', 'Scheduled maintenance', 'Tonight 2–4am UTC', false, NULL)
ON CONFLICT DO NOTHING;
