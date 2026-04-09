-- HealthMesh Master Seed Data
-- Run schema.sql first, then this file to populate the database

INSERT OR IGNORE INTO teams (id, name, tier, health_score, incident_count, lead_name, slack_channel, description) VALUES
('platform', 'Platform Engineering', 1, 96.2, 1, 'Alex Chen', '#platform-eng', 'Core platform infrastructure and tooling'),
('payments', 'Payments', 1, 91.4, 2, 'Sarah Kim', '#payments-eng', 'Payment processing and billing services'),
('commerce', 'Commerce', 1, 88.7, 3, 'Marcus Johnson', '#commerce-eng', 'Shopping, catalog, and order management'),
('discovery', 'Search & Discovery', 2, 72.1, 2, 'Priya Patel', '#search-eng', 'Search, recommendations, and indexing'),
('ml', 'Machine Learning', 2, 85.3, 1, 'David Wu', '#ml-eng', 'ML model serving and feature pipelines'),
('logistics', 'Logistics', 2, 93.8, 0, 'Elena Rodriguez', '#logistics-eng', 'Shipping, tracking, and fulfillment'),
('risk', 'Risk & Security', 1, 97.1, 0, 'James Park', '#risk-security', 'Fraud detection, compliance, and audit'),
('analytics', 'Analytics & Data', 2, 89.6, 1, 'Natasha Williams', '#analytics-eng', 'Data pipelines, reporting, and warehousing');

INSERT OR IGNORE INTO environments (id, name, health_score, app_count, incident_count, status) VALUES
('production', 'Production', 91.4, 13, 2, 'degraded'),
('staging', 'Staging', 96.8, 13, 0, 'healthy'),
('development', 'Development', 98.5, 13, 0, 'healthy'),
('qa', 'QA', 94.2, 11, 0, 'healthy');

INSERT OR IGNORE INTO applications (id, name, description, team_id, environment, status, criticality, health_score, uptime, latency_p99, rpm, app_type, runtime, version, platform, tags, incident_count, dependency_count, connector_count, owner_name) VALUES
('payments-api', 'Payments API', 'Core payment processing service handling charge, refund, and payment method operations.', 'payments', 'Production', 'healthy', 'P0', 94.0, 99.98, 42.0, 12400.0, 'API Service', 'Node.js 20', 'v2.14.1', 'Kubernetes', '["payments","critical","pci-dss"]', 0, 6, 3, 'Sarah Kim'),
('customer-auth-service', 'Customer Auth Service', 'Identity and authentication service providing OAuth2, JWT, and MFA capabilities.', 'platform', 'Production', 'warning', 'P0', 71.0, 99.91, 310.0, 8200.0, 'API Service', 'Go 1.22', 'v4.2.0', 'Kubernetes', '["auth","critical","identity"]', 1, 4, 2, 'Alex Chen'),
('order-processing-gateway', 'Order Processing Gateway', 'Orchestrates order lifecycle from placement through fulfillment and delivery.', 'commerce', 'Production', 'healthy', 'P1', 88.0, 99.95, 95.0, 4100.0, 'API Service', 'Java 21', 'v3.8.2', 'ECS', '["orders","commerce","gateway"]', 0, 8, 3, 'Marcus Johnson'),
('search-api', 'Search API', 'Full-text and semantic search service powering product discovery and filtering.', 'discovery', 'Production', 'critical', 'P1', 55.0, 99.7, 620.0, 18500.0, 'API Service', 'Python 3.12', 'v1.9.5', 'Kubernetes', '["search","elasticsearch","critical"]', 1, 5, 2, 'Priya Patel'),
('recommendation-engine', 'Recommendation Engine', 'ML-powered product recommendation service using collaborative filtering.', 'ml', 'Production', 'warning', 'P1', 78.0, 99.85, 185.0, 22000.0, 'ML Service', 'Python 3.11', 'v2.3.0', 'Kubernetes', '["ml","recommendations","personalization"]', 1, 4, 2, 'David Wu'),
('notification-engine', 'Notification Engine', 'Multi-channel notification service for email, SMS, push, and in-app alerts.', 'platform', 'Production', 'healthy', 'P1', 92.0, 99.93, 55.0, 6800.0, 'Service', 'Node.js 18', 'v3.1.4', 'Kubernetes', '["notifications","messaging"]', 0, 3, 2, 'Jordan Blake'),
('inventory-service', 'Inventory Service', 'Real-time inventory tracking, reservation, and stock management service.', 'commerce', 'Production', 'healthy', 'P1', 96.0, 99.97, 28.0, 3200.0, 'Service', 'Go 1.22', 'v1.6.3', 'Kubernetes', '["inventory","commerce"]', 0, 2, 2, 'Ling Zhao'),
('claims-portal-api', 'Claims Portal API', 'Insurance claims processing portal API with workflow automation.', 'commerce', 'Production', 'healthy', 'P1', 89.0, 99.92, 118.0, 1400.0, 'API Service', 'Java 17', 'v2.0.1', 'ECS', '["claims","portal"]', 0, 3, 2, 'Fatima Hassan'),
('fraud-detection-service', 'Fraud Detection Service', 'Real-time transaction fraud scoring using ML models and rule engines.', 'risk', 'Production', 'healthy', 'P0', 97.0, 99.99, 18.0, 15000.0, 'ML Service', 'Python 3.12', 'v4.1.2', 'Kubernetes', '["fraud","ml","security","critical"]', 0, 3, 3, 'James Park'),
('reporting-hub', 'Reporting Hub', 'Business intelligence and analytics reporting service with scheduled exports.', 'analytics', 'Production', 'healthy', 'P2', 90.0, 99.89, 250.0, 800.0, 'Service', 'Python 3.11', 'v1.4.0', 'ECS', '["reporting","analytics","bi"]', 0, 4, 2, 'Natasha Williams'),
('identity-service', 'Identity Service', 'Enterprise identity management with SSO, RBAC, and user provisioning.', 'platform', 'Production', 'healthy', 'P0', 95.0, 99.98, 32.0, 5600.0, 'Service', 'Go 1.22', 'v2.8.0', 'Kubernetes', '["identity","sso","critical"]', 0, 2, 3, 'Riley Foster'),
('customer-360-platform', 'Customer 360 Platform', 'Unified customer data platform aggregating profiles, behaviors, and interactions.', 'analytics', 'Production', 'healthy', 'P1', 87.0, 99.9, 145.0, 2200.0, 'Platform', 'Python 3.11', 'v1.2.3', 'Kubernetes', '["customer-data","cdp"]', 0, 5, 2, 'Omar Ali'),
('api-gateway', 'API Gateway', 'Edge API gateway handling routing, auth, rate limiting, and SSL termination.', 'platform', 'Production', 'healthy', 'P0', 98.0, 99.99, 12.0, 45000.0, 'Gateway', 'NGINX / Envoy', 'v3.0.1', 'Kubernetes', '["gateway","critical","infrastructure"]', 0, 10, 3, 'Alex Chen');

INSERT OR IGNORE INTO connector_templates (id, name, category, description, logo, color, version, popular) VALUES
('datadog', 'Datadog', 'APM', 'Full-stack observability with APM, metrics, logs, and synthetics.', 'DD', '#632CA6', 'v2', 1),
('prometheus', 'Prometheus', 'Infra', 'Open-source metrics monitoring and alerting toolkit.', 'PR', '#E6522C', 'v2.48', 1),
('cloudwatch', 'AWS CloudWatch', 'Cloud', 'AWS monitoring and observability service.', 'CW', '#FF9900', 'API v2', 1),
('splunk', 'Splunk Enterprise', 'Logs', 'Enterprise log management and SIEM platform.', 'SP', '#00A65A', 'v9.2', 0),
('appdynamics', 'AppDynamics', 'APM', 'Cisco AppDynamics APM and business performance monitoring.', 'AD', '#1799D3', 'v24.1', 0),
('grafana', 'Grafana Cloud', 'Infra', 'Open-source metrics, logs, and traces visualization platform.', 'GR', '#F46800', 'v10.2', 1),
('dynatrace', 'Dynatrace', 'APM', 'AI-powered full-stack observability platform.', 'DY', '#1496FF', 'v1.291', 0),
('pagerduty', 'PagerDuty', 'Incident', 'Digital operations management and incident response platform.', 'PD', '#06AC38', 'API v2', 1),
('kafka-monitor', 'Kafka Monitor', 'Messaging', 'Kafka cluster health and consumer lag monitoring.', 'KF', '#231F20', 'v3.6', 0),
('db-monitor', 'Database Monitor', 'Database', 'Multi-database query performance and connection pool monitoring.', 'DB', '#336791', 'v1.4', 0),
('synthetic-health', 'Synthetic Health', 'Synthetic', 'Browser and API synthetic monitoring with global execution.', 'SY', '#0098D9', 'v2.0', 0),
('logicmonitor', 'LogicMonitor', 'Infra', 'Hybrid IT infrastructure monitoring platform.', 'LM', '#FF5733', 'v6.8', 0);

INSERT OR IGNORE INTO connector_instances (id, template_id, name, category, environment, status, health_pct, app_count, version, last_sync, metrics_count) VALUES
('conn-datadog-prod', 'datadog', 'Datadog (Production)', 'APM', 'Production', 'healthy', 99.0, 42, 'v2.1.0', '2m ago', '1,842'),
('conn-prometheus-prod', 'prometheus', 'Prometheus (Production)', 'Infra', 'Production', 'healthy', 96.0, 38, 'v2.48.0', '30s ago', '3.2M'),
('conn-cloudwatch-aws', 'cloudwatch', 'CloudWatch (AWS)', 'Cloud', 'Production', 'healthy', 98.0, 29, 'API v2', '1m ago', '847K'),
('conn-splunk-prod', 'splunk', 'Splunk Enterprise', 'Logs', 'Production', 'warning', 71.0, 15, 'v9.2.1', '12m ago', '18.4B logs'),
('conn-appdynamics-prod', 'appdynamics', 'AppDynamics (Prod)', 'APM', 'Production', 'healthy', 94.0, 18, 'v24.1', '45s ago', '426'),
('conn-grafana-cloud', 'grafana', 'Grafana Cloud', 'Infra', 'Production', 'healthy', 92.0, 22, 'v10.2', '3m ago', '2.1M'),
('conn-dynatrace-staging', 'dynatrace', 'Dynatrace (Staging)', 'APM', 'Staging', 'healthy', 97.0, 12, 'v1.291', '1m ago', '289'),
('conn-pagerduty-prod', 'pagerduty', 'PagerDuty', 'Incident', 'Production', 'healthy', 100.0, 34, 'API v2', 'real-time', '12 services'),
('conn-kafka-prod', 'kafka-monitor', 'Kafka Monitor', 'Messaging', 'Production', 'healthy', 88.0, 9, 'v3.6.0', '15s ago', '47 topics'),
('conn-db-monitor-prod', 'db-monitor', 'Database Monitor', 'Database', 'Production', 'warning', 68.0, 17, 'v1.4.2', '8m ago', '142 queries'),
('conn-synthetic-prod', 'synthetic-health', 'Synthetic Health', 'Synthetic', 'Production', 'healthy', 95.0, 24, 'v2.0.1', '5m ago', '68 checks'),
('conn-logicmonitor-prod', 'logicmonitor', 'LogicMonitor', 'Infra', 'Production', 'error', 0.0, 0, 'v6.8', '2h ago', '0');

INSERT OR IGNORE INTO health_rules (id, name, metric, operator, threshold, severity, enabled, scope, trigger_count, version, last_triggered, description) VALUES
('rule-p99-latency', 'P99 Latency SLO', 'latency_p99', 'gt', 300.0, 'critical', 1, 'P0 Services', 12, 3, '14m ago', 'Triggers when P99 response time exceeds 300ms SLO threshold for P0 services'),
('rule-error-rate', 'Error Rate Threshold', 'error_rate', 'gt', 1.0, 'critical', 1, 'All Services', 8, 2, '1h ago', 'Fires when service error rate exceeds 1% over a 5-minute window'),
('rule-memory-pressure', 'Memory Pressure Alert', 'memory_pct', 'gt', 85.0, 'warning', 1, 'All Services', 24, 1, '2m ago', 'Warns when container memory utilization exceeds 85% of limit'),
('rule-cpu-saturation', 'CPU Saturation', 'cpu_pct', 'gt', 90.0, 'warning', 1, 'All Services', 6, 1, '3h ago', 'Alerts when CPU utilization exceeds 90% sustained for 10 minutes'),
('rule-throughput-drop', 'Request Throughput Drop', 'throughput_pct_change', 'lt', -25.0, 'warning', 1, 'P0, P1 Services', 3, 2, '2d ago', 'Detects significant traffic drops that could indicate upstream issues'),
('rule-db-conn-pool', 'Database Connection Pool', 'db_connection_pool_pct', 'gt', 80.0, 'warning', 1, 'Database Connectors', 15, 1, '4h ago', 'Warns when DB connection pool utilization exceeds 80% capacity'),
('rule-slo-burn-rate', 'SLO Burn Rate (1h)', 'slo_burn_rate_1h', 'gt', 14.4, 'critical', 1, 'P0, P1 Services', 4, 2, '6h ago', 'Fires on fast SLO burn rate that would exhaust monthly error budget in <72h'),
('rule-availability', 'Availability Below 99%', 'availability', 'lt', 99.0, 'critical', 1, 'All Services', 2, 1, '1w ago', 'Critical alert when service availability drops below 99% SLA commitment');

INSERT OR IGNORE INTO incidents (id, app_id, app_name, title, severity, status, duration, assignee, ai_cause, health_impact, started_at, resolved_at) VALUES
('INC-2847', 'search-api', 'Search API', 'search-api P99 latency exceeds SLO threshold (620ms)', 'critical', 'active', '14m', 'Priya Patel', 'Elasticsearch cluster health degraded (yellow status) causing query routing to overloaded shards.', '-39pts', '14m ago', ''),
('INC-2846', 'customer-auth-service', 'Customer Auth Service', 'auth-service elevated 5xx error rate (0.18%)', 'warning', 'active', '1h 22m', 'Alex Chen', 'Memory pressure at 85% causing increased GC pause times. LDAP directory connection timeouts.', '-14pts', '1h 22m ago', ''),
('INC-2844', 'recommendation-engine', 'Recommendation Engine', 'recommendation-engine degraded throughput (-18% vs baseline)', 'degraded', 'active', '3h 5m', 'David Wu', 'Model serving latency increased after v2.3.0 deployment. Feature store cache hit rate dropped.', '-10pts', '3h 5m ago', ''),
('INC-2841', 'notification-engine', 'Notification Engine', 'notification-worker queue backlog (4.2K messages)', 'warning', 'resolved', '42m', 'Jordan Blake', 'Kafka consumer lag spike due to external email provider throttling.', '-8pts', '6h ago', '5h 18m ago'),
('INC-2839', 'customer-auth-service', 'Customer Auth Service', 'catalog-service cache miss spike (92% miss rate)', 'warning', 'resolved', '1h 12m', 'Marcus Johnson', 'Redis cache eviction after memory limit breach caused cold cache state.', '-12pts', '1d ago', '23h ago');

INSERT OR IGNORE INTO alerts (id, app_id, app_name, rule_name, metric, value, threshold, severity, status, fired_at, environment) VALUES
('ALT-1247', 'search-api', 'Search API', 'P99 Latency SLO', 'latency_p99', '620ms', '300ms', 'critical', 'firing', '14m ago', 'Production'),
('ALT-1246', 'customer-auth-service', 'Customer Auth Service', 'Memory Pressure Alert', 'memory_pct', '85%', '85%', 'warning', 'firing', '1h ago', 'Production'),
('ALT-1245', 'search-api', 'Search API', 'Error Rate Threshold', 'error_rate', '1.8%', '1%', 'critical', 'firing', '2h ago', 'Production'),
('ALT-1244', 'payments-api', 'Payments API', 'Database Connection Pool', 'db_connection_pool_pct', '74%', '80%', 'warning', 'pending', '3h ago', 'Production'),
('ALT-1243', 'recommendation-engine', 'Recommendation Engine', 'Request Throughput Drop', 'throughput_pct_change', '-18%', '-25%', 'warning', 'firing', '3h ago', 'Production');

INSERT OR IGNORE INTO dependency_nodes (id, label, node_type, status, latency, error_rate, rps, uptime, version, team, x, y) VALUES
('api-gateway', 'API Gateway', 'gateway', 'healthy', '12ms', '0.01%', '45K', '99.99%', 'v3.0.1', 'Platform', 400, 50),
('auth-service', 'Auth Service', 'service', 'warning', '310ms', '0.18%', '8.2K', '99.91%', 'v4.2.0', 'Platform', 200, 180),
('payments-api', 'Payments API', 'service', 'healthy', '42ms', '0.04%', '12.4K', '99.98%', 'v2.14.1', 'Payments', 100, 320),
('catalog-service', 'Catalog Service', 'service', 'healthy', '28ms', '0.00%', '18K', '99.97%', 'v2.1.0', 'Commerce', 300, 320),
('search-api', 'Search API', 'service', 'critical', '620ms', '1.8%', '18.5K', '99.70%', 'v1.9.5', 'Discovery', 500, 320),
('recommendation-engine', 'Recommendation Engine', 'service', 'warning', '185ms', '0.22%', '22K', '99.85%', 'v2.3.0', 'ML', 700, 320),
('db-primary', 'DB Primary', 'database', 'healthy', '4ms', '0.00%', '12K', '99.99%', 'PostgreSQL 15', 'Platform', 200, 480),
('redis-cluster', 'Redis Cluster', 'cache', 'healthy', '0.8ms', '0.00%', '280K', '99.99%', 'Redis 7.2', 'Platform', 400, 480),
('event-bus', 'Event Bus (Kafka)', 'queue', 'healthy', '8ms', '0.01%', '180K', '99.98%', 'Kafka 3.6', 'Platform', 600, 480),
('stripe-api', 'Stripe API', 'external', 'healthy', '95ms', '0.02%', '4.8K', '99.95%', 'API v3', 'External', 100, 480);

INSERT OR IGNORE INTO ai_insights (id, app_id, app_name, insight_type, priority, title, description, confidence, impact, recommendation, generated_at) VALUES
('ins-001', 'search-api', 'Search API', 'anomaly', 'high', 'Anomalous EU traffic surge detected on search-api', 'Search API is experiencing a 94% confidence anomaly: EU region traffic has increased 340% above baseline over the past 45 minutes.', 0.94, 'High - 18.5K rpm affected', 'Scale Elasticsearch cluster to handle increased EU load. Review CDN routing rules to balance traffic distribution.', '8m ago'),
('ins-002', 'customer-auth-service', 'Customer Auth Service', 'prediction', 'high', 'Memory exhaustion predicted for auth-service in ~2 hours', 'ML model predicts auth-service will reach OOM condition within 2 hours based on current memory growth rate.', 0.87, 'High - Auth failures for all users', 'Immediately increase memory limits from 512Mi to 768Mi. Investigate memory leak in v4.2.0.', '15m ago'),
('ins-003', 'payments-api', 'Payments API', 'correlation', 'medium', 'GC pause correlation with payment latency spikes detected', 'Strong correlation (r=0.91) found between JVM GC pause events and P99 latency spikes on the payments service.', 0.91, 'Medium - Intermittent latency spikes', 'Tune JVM GC settings: switch to G1GC or ZGC for lower pause times.', '1h ago'),
('ins-004', 'customer-360-platform', 'Customer 360 Platform', 'optimization', 'low', 'Customer 360 caching opportunity: 67% of queries are cache-eligible', 'Analysis of query patterns shows 67% of Customer 360 API requests query the same 500 customer profiles.', 0.82, 'Low - Performance optimization', 'Implement Redis read-through cache for customer profile queries with 5-minute TTL.', '2h ago'),
('ins-005', 'payments-api', 'Payments API', 'capacity', 'medium', 'Payments-api Redis connection pool approaching limit at current growth rate', 'Redis connection pool utilization is at 74% and growing at 2% per day.', 0.89, 'Medium - Connection exhaustion risk', 'Increase Redis connection pool size from 100 to 150 connections.', '3h ago');

INSERT OR IGNORE INTO sla_settings (id, app_id, name, target_pct, current_pct, error_budget_remaining, period, status) VALUES
('sla-001', 'payments-api', 'Payments API Availability SLA', 99.95, 99.98, 92.0, '30d', 'healthy'),
('sla-002', 'customer-auth-service', 'Auth Service Availability SLA', 99.9, 99.91, 45.0, '30d', 'warning'),
('sla-003', 'search-api', 'Search API Performance SLA', 99.5, 99.7, 24.0, '30d', 'warning'),
('sla-004', 'fraud-detection-service', 'Fraud Detection Availability SLA', 99.99, 99.99, 98.0, '30d', 'healthy'),
('sla-005', 'api-gateway', 'API Gateway Availability SLA', 99.99, 99.99, 97.0, '30d', 'healthy');

INSERT OR IGNORE INTO maintenance_windows (id, title, description, start_time, end_time, status, created_by) VALUES
('mw-001', 'Elasticsearch Cluster Rebalancing', 'Scheduled shard rebalancing and index optimization', '2026-04-10T02:00:00Z', '2026-04-10T04:00:00Z', 'scheduled', 'Priya Patel'),
('mw-002', 'Auth Service Memory Limit Update', 'Updating memory limits and JVM tuning for auth service', '2026-04-09T22:00:00Z', '2026-04-09T23:00:00Z', 'active', 'Alex Chen'),
('mw-003', 'Database Schema Migration v2.1', 'Payments database schema migration', '2026-04-11T03:00:00Z', '2026-04-11T04:30:00Z', 'scheduled', 'Carlos Mendez'),
('mw-004', 'Redis Cluster Upgrade', 'Upgrading Redis cluster from 7.2 to 7.4', '2026-04-08T01:00:00Z', '2026-04-08T02:30:00Z', 'completed', 'Jordan Blake');

INSERT OR IGNORE INTO app_settings (key, value, category, description) VALUES
('org_name', 'Acme Corporation', 'general', 'Organization display name'),
('default_environment', 'Production', 'general', 'Default environment for new apps'),
('default_timezone', 'UTC', 'general', 'Default timezone for timestamps'),
('health_refresh_interval', '60', 'general', 'Health score refresh interval in seconds'),
('alert_cooldown_minutes', '5', 'alerting', 'Minimum minutes between repeat alerts'),
('incident_auto_assign', 'true', 'incidents', 'Auto-assign incidents to on-call engineer'),
('data_retention_days', '90', 'data', 'Days to retain metric history'),
('ai_insights_enabled', 'true', 'ai', 'Enable AI-powered insights generation');
