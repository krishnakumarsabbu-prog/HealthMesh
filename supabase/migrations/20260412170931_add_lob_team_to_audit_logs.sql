/*
  # Add lob_id and team_id to audit_logs table

  ## Summary
  Extends the audit logging system with LOB and team scoping fields so that
  LOB Admins can filter and view only audit events relevant to their LOB.

  ## Changes

  ### Modified Tables
  - `audit_logs` (if it exists)
    - Add `lob_id` (uuid, nullable, fk → lobs) — the LOB context of the action
    - Add `team_id` (uuid, nullable, fk → org_teams) — the team context of the action

  ## Notes
  - If the `audit_logs` table doesn't exist yet (managed by backend), the columns
    are added conditionally via DO blocks so the migration is safe to run in any state.
  - Existing rows will have NULL for the new columns, which is correct.
*/

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'audit_logs' AND column_name = 'lob_id'
    ) THEN
      ALTER TABLE audit_logs ADD COLUMN lob_id uuid REFERENCES lobs(id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'audit_logs' AND column_name = 'team_id'
    ) THEN
      ALTER TABLE audit_logs ADD COLUMN team_id uuid REFERENCES org_teams(id);
    END IF;
  END IF;
END $$;
