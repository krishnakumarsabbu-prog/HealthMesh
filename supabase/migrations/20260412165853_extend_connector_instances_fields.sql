/*
  # Extend connector_instances with full metadata fields

  ## Summary
  Adds missing fields to connector_instances table to support the full
  ConnectorHub feature set including health scoring, app counts, version
  tracking, capabilities, and display metadata.

  ## Changes
  - Added `version` (text) - connector version string
  - Added `health_score` (int) - 0-100 health percentage
  - Added `apps_connected` (int) - number of apps using this connector
  - Added `capabilities` (text[]) - list of capability strings
  - Added `description` (text) - human-readable description
  - Added `abbr` (text) - short abbreviation for display
  - Added `icon_bg` (text) - Tailwind classes for icon background
  - Added `bg_color` (text) - Tailwind gradient classes for card background
  - Added `last_sync` (text) - human-readable last sync time
  - Added `usage_count` (bigint) - total usage count

  ## Notes
  - All new columns are nullable with safe defaults
  - No existing data is modified
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'connector_instances' AND column_name = 'version'
  ) THEN
    ALTER TABLE connector_instances ADD COLUMN version text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'connector_instances' AND column_name = 'health_score'
  ) THEN
    ALTER TABLE connector_instances ADD COLUMN health_score int NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'connector_instances' AND column_name = 'apps_connected'
  ) THEN
    ALTER TABLE connector_instances ADD COLUMN apps_connected int NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'connector_instances' AND column_name = 'capabilities'
  ) THEN
    ALTER TABLE connector_instances ADD COLUMN capabilities text[] NOT NULL DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'connector_instances' AND column_name = 'description'
  ) THEN
    ALTER TABLE connector_instances ADD COLUMN description text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'connector_instances' AND column_name = 'abbr'
  ) THEN
    ALTER TABLE connector_instances ADD COLUMN abbr text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'connector_instances' AND column_name = 'icon_bg'
  ) THEN
    ALTER TABLE connector_instances ADD COLUMN icon_bg text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'connector_instances' AND column_name = 'bg_color'
  ) THEN
    ALTER TABLE connector_instances ADD COLUMN bg_color text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'connector_instances' AND column_name = 'last_sync'
  ) THEN
    ALTER TABLE connector_instances ADD COLUMN last_sync text NOT NULL DEFAULT 'Never';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'connector_instances' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE connector_instances ADD COLUMN usage_count bigint NOT NULL DEFAULT 0;
  END IF;
END $$;

INSERT INTO connector_instances (id, name, template_id, category, status, environment, lob_id, managed_by, version, health_score, apps_connected, capabilities, description, abbr, icon_bg, bg_color, last_sync, usage_count)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Datadog (Production)', 'datadog', 'APM', 'active', 'Production', '11111111-0000-0000-0000-000000000001', 'Digital Commerce', 'v2.1.0', 99, 42, ARRAY['APM','Metrics','Traces','Logs'], 'Full-stack observability platform with APM, infrastructure metrics, and log management', 'DD', 'bg-violet-500/10 text-violet-500', 'from-violet-500/15 to-violet-500/5', '12s ago', 1842),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Prometheus (Production)', 'prometheus', 'Infra', 'active', 'Production', '11111111-0000-0000-0000-000000000002', 'Financial Services', 'v2.48.0', 96, 38, ARRAY['Metrics','Alerting','Time Series'], 'Open-source systems monitoring and alerting toolkit with multi-dimensional data model', 'PR', 'bg-orange-500/10 text-orange-500', 'from-orange-500/15 to-orange-500/5', '28s ago', 3200000),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'CloudWatch (AWS)', 'cloudwatch', 'Cloud', 'active', 'Production', NULL, NULL, 'API v2', 98, 29, ARRAY['Metrics','Logs','Events','Alarms'], 'AWS native observability service for resources, applications, and services', 'CW', 'bg-amber-500/10 text-amber-500', 'from-amber-500/15 to-amber-500/5', '1m ago', 9420),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Splunk Enterprise', 'splunk', 'Logs', 'warning', 'Production', '11111111-0000-0000-0000-000000000002', 'Financial Services', 'v9.2.1', 71, 15, ARRAY['Logs','Search','Dashboards','Alerts'], 'Enterprise data platform for log aggregation, search, and operational intelligence', 'SP', 'bg-green-500/10 text-green-600', 'from-green-500/15 to-green-500/5', '18m ago', 580000),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'AppDynamics (Prod)', 'appdynamics', 'APM', 'active', 'Production', '11111111-0000-0000-0000-000000000001', 'Digital Commerce', 'v24.1', 94, 18, ARRAY['APM','Business Transactions','Server Monitoring'], 'Application performance management with business transaction monitoring and AI anomaly detection', 'AD', 'bg-blue-500/10 text-blue-500', 'from-blue-500/15 to-blue-500/5', '45s ago', 2140),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'Grafana Cloud', 'grafana', 'Infra', 'active', 'Production', '11111111-0000-0000-0000-000000000003', 'Data & AI', 'v10.2', 92, 22, ARRAY['Dashboards','Alerting','Loki','Tempo'], 'Open-source visualization and monitoring platform with multi-source dashboard support', 'GF', 'bg-rose-500/10 text-rose-500', 'from-rose-500/15 to-rose-500/5', '3m ago', 4300),
  ('aaaaaaaa-0000-0000-0000-000000000007', 'PagerDuty', 'pagerduty', 'Incident', 'active', 'Production', NULL, NULL, 'API v2', 100, 34, ARRAY['Incidents','Escalations','On-Call','Postmortems'], 'Digital operations management platform for incident response and on-call scheduling', 'PD', 'bg-emerald-500/10 text-emerald-500', 'from-emerald-500/15 to-emerald-500/5', 'Just now', 318),
  ('aaaaaaaa-0000-0000-0000-000000000008', 'Database Monitor', 'database', 'Database', 'warning', 'Production', '11111111-0000-0000-0000-000000000001', 'Digital Commerce', 'v1.4.2', 68, 17, ARRAY['Query Performance','Connections','Replication','Locks'], 'Deep database observability for Postgres, MySQL, and MongoDB with query-level insights', 'DB', 'bg-cyan-500/10 text-cyan-500', 'from-cyan-500/15 to-cyan-500/5', '12m ago', 4800),
  ('aaaaaaaa-0000-0000-0000-000000000009', 'Synthetic Health', 'synthetic', 'Synthetic', 'active', 'Production', '11111111-0000-0000-0000-000000000002', 'Financial Services', 'v2.0.1', 95, 24, ARRAY['HTTP Probes','SLA Tracking','Geo Tests','Flow Tests'], 'Proactive synthetic monitoring for APIs and user flows with global test locations', 'SY', 'bg-pink-500/10 text-pink-500', 'from-pink-500/15 to-pink-500/5', '5m ago', 144),
  ('aaaaaaaa-0000-0000-0000-000000000010', 'Kafka Monitor', 'kafka', 'Messaging', 'active', 'Production', '11111111-0000-0000-0000-000000000003', 'Data & AI', 'v3.6.0', 88, 9, ARRAY['Queue Depth','Consumer Lag','Throughput','Latency'], 'Real-time message queue monitoring for Kafka clusters with consumer lag alerting', 'KF', 'bg-slate-500/10 text-slate-500', 'from-slate-500/15 to-slate-500/5', '8s ago', 820000)
ON CONFLICT (id) DO NOTHING;
