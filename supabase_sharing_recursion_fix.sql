-- ==================================================
-- SQL Fix for Infinite Recursion in RLS Policies
-- Run this in your Supabase SQL Editor
-- ==================================================

-- 1. Drop existing RLS policies on project_shares and projects
DROP POLICY IF EXISTS "Owners can manage project shares" ON project_shares;
DROP POLICY IF EXISTS "Invited users can view shares of projects shared with them" ON project_shares;
DROP POLICY IF EXISTS "Users can view projects they own or are shared with" ON projects;

-- 2. Re-create the project_shares table with an owner_id column
DROP TABLE IF EXISTS project_shares CASCADE;

CREATE TABLE project_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  permission text NOT NULL CHECK (permission IN ('read', 'write')),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX project_shares_project_id_user_email_idx 
  ON project_shares(project_id, user_email);

ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

-- 3. Create non-recursive policies

-- project_shares: Owners can do all, invited users can only select
CREATE POLICY "Owners can manage project shares"
  ON project_shares FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view shares they are involved in"
  ON project_shares FOR SELECT
  USING (auth.uid() = owner_id OR user_email = auth.jwt()->>'email');

-- projects: Users can view projects they own or are shared with
CREATE POLICY "Users can view projects they own or are shared with"
  ON projects FOR SELECT
  USING (
    auth.uid() = owner_id OR EXISTS (
      SELECT 1 FROM project_shares ps
      WHERE ps.project_id = projects.id AND ps.user_email = auth.jwt()->>'email'
    )
  );
