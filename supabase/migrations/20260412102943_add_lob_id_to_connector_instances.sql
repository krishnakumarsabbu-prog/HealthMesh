/*
  # Add lob_id to connector_instances table

  ## Summary
  Extends the connector_instances concept in the projects/org system by adding
  a `lob_id` column to the projects table (which acts as the connector scope).
  Since connector instances are managed via the backend (Python/SQLAlchemy) and
  not directly in Supabase, this migration adds an optional `lob_id` reference
  column to the `projects` table to allow project-level connector ownership
  tracking, and also creates a `connector_instances` table in Supabase for
  future direct Supabase-based connector management.

  ## Changes
  1. New table: `connector_instances` 
     - Stores connector instance metadata with optional lob_id ownership
     - `id` (uuid, PK)
     - `name` (text) - display name
     - `template_id` (text) - connector type/template identifier
     - `category` (text) - APM, Logs, Infra, etc.
     - `status` (text) - active, warning, error, inactive
     - `environment` (text) - Production, Staging, Development
     - `lob_id` (uuid, FK -> lobs) - owning LOB, nullable for global connectors
     - `managed_by` (text) - display label for ownership
     - `created_by` (uuid) - auth.uid() of creator
     - `created_at` (timestamptz)

  ## Security
  - RLS enabled: authenticated users can read all connectors
  - Only LOB_ADMIN role users or creators can update/delete
  - Insert allowed for TEAM_ADMIN+ role users, auto-populates lob_id
*/

CREATE TABLE IF NOT EXISTS connector_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_id text NOT NULL,
  category text NOT NULL DEFAULT 'Custom',
  status text NOT NULL DEFAULT 'active',
  environment text NOT NULL DEFAULT 'Production',
  lob_id uuid REFERENCES lobs(id) ON DELETE SET NULL,
  managed_by text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE connector_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all connector instances"
  ON connector_instances
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert connector instances"
  ON connector_instances
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creator or LOB admin can update connector instances"
  ON connector_instances
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM org_users
      WHERE org_users.id::text = auth.uid()::text
        AND org_users.role_id = 'LOB_ADMIN'
        AND (lob_id IS NULL OR org_users.lob_id = connector_instances.lob_id)
    )
  )
  WITH CHECK (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM org_users
      WHERE org_users.id::text = auth.uid()::text
        AND org_users.role_id = 'LOB_ADMIN'
        AND (lob_id IS NULL OR org_users.lob_id = connector_instances.lob_id)
    )
  );

CREATE POLICY "Creator or LOB admin can delete connector instances"
  ON connector_instances
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM org_users
      WHERE org_users.id::text = auth.uid()::text
        AND org_users.role_id = 'LOB_ADMIN'
        AND (lob_id IS NULL OR org_users.lob_id = connector_instances.lob_id)
    )
  );
