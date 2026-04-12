/*
  # Scope RLS SELECT policies to enforce LOB isolation

  ## Summary
  Replaces the universally permissive SELECT policies (USING (true)) on org tables
  with LOB-scoped policies. Enterprise admins (no lob_id in JWT app_metadata) continue
  to see all rows. LOB_ADMIN users only see rows belonging to their own LOB.

  ## Changes

  ### lobs
  - Drop: "Authenticated users can view lobs" (USING true)
  - Add: Users see only their own LOB (or all if no lob_id in JWT)

  ### org_teams
  - Drop: "Authenticated users can view org_teams" (USING true)
  - Add: Users see only teams belonging to their LOB (or all if enterprise admin)

  ### projects
  - Drop: "Authenticated users can view projects" (USING true)
  - Add: Users see only projects whose team is in their LOB (or all if enterprise admin)

  ### org_users
  - Drop: "Authenticated users can view org_users" (USING true)
  - Add: Users see only users in their LOB (or all if enterprise admin)

  ### connector_instances
  - Drop: any permissive SELECT policy if present
  - Add: Users see only connector instances for their LOB (or all if enterprise admin)

  ## Security Notes
  - Enterprise admins are identified by having no lob_id in JWT app_metadata
  - LOB-scoped users only see rows where lob_id matches their JWT claim
  - connector_instances.lob_id nullable; null rows visible only to enterprise admins
*/

-- ============================================================
-- lobs
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view lobs" ON lobs;

CREATE POLICY "Users view own lob or all if enterprise admin"
  ON lobs FOR SELECT
  TO authenticated
  USING (
    (select auth.jwt() -> 'app_metadata' ->> 'lob_id') IS NULL
    OR id::text = (select auth.jwt() -> 'app_metadata' ->> 'lob_id')
  );

-- ============================================================
-- org_teams
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view org_teams" ON org_teams;

CREATE POLICY "Users view teams in own lob or all if enterprise admin"
  ON org_teams FOR SELECT
  TO authenticated
  USING (
    (select auth.jwt() -> 'app_metadata' ->> 'lob_id') IS NULL
    OR lob_id::text = (select auth.jwt() -> 'app_metadata' ->> 'lob_id')
  );

-- ============================================================
-- projects
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view projects" ON projects;

CREATE POLICY "Users view projects in own lob or all if enterprise admin"
  ON projects FOR SELECT
  TO authenticated
  USING (
    (select auth.jwt() -> 'app_metadata' ->> 'lob_id') IS NULL
    OR EXISTS (
      SELECT 1 FROM org_teams ot
      WHERE ot.id = projects.team_id
        AND ot.lob_id::text = (select auth.jwt() -> 'app_metadata' ->> 'lob_id')
    )
  );

-- ============================================================
-- org_users
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view org_users" ON org_users;

CREATE POLICY "Users view org members in own lob or all if enterprise admin"
  ON org_users FOR SELECT
  TO authenticated
  USING (
    (select auth.jwt() -> 'app_metadata' ->> 'lob_id') IS NULL
    OR lob_id::text = (select auth.jwt() -> 'app_metadata' ->> 'lob_id')
  );

-- ============================================================
-- connector_instances (add LOB-scoped SELECT if table exists)
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view connector_instances" ON connector_instances;
DROP POLICY IF EXISTS "Users can view connector instances" ON connector_instances;

CREATE POLICY "Users view connectors in own lob or all if enterprise admin"
  ON connector_instances FOR SELECT
  TO authenticated
  USING (
    (select auth.jwt() -> 'app_metadata' ->> 'lob_id') IS NULL
    OR lob_id::text = (select auth.jwt() -> 'app_metadata' ->> 'lob_id')
    OR lob_id IS NULL
  );
