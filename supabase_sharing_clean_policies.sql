-- ==================================================
-- SQL Fix for RLS Column Binding in Nodes & Edges
-- Run this in your Supabase SQL Editor if inserting
-- nodes or edges triggers a policy violation.
-- ==================================================

-- 1. Drop current collaborative policies to rebuild them clean
DROP POLICY IF EXISTS "Users can view nodes of owned or shared projects" ON nodes;
DROP POLICY IF EXISTS "Users can insert nodes into owned or shared projects with write access" ON nodes;
DROP POLICY IF EXISTS "Users can update nodes of owned or shared projects with write access" ON nodes;
DROP POLICY IF EXISTS "Users can delete nodes of owned or shared projects with write access" ON nodes;

DROP POLICY IF EXISTS "Users can view edges of owned or shared projects" ON edges;
DROP POLICY IF EXISTS "Users can insert edges into owned or shared projects with write access" ON edges;
DROP POLICY IF EXISTS "Users can update edges of owned or shared projects with write access" ON edges;
DROP POLICY IF EXISTS "Users can delete edges of owned or shared projects with write access" ON edges;

DROP POLICY IF EXISTS "Users can view checklist items of owned or shared projects" ON checklist_items;
DROP POLICY IF EXISTS "Users can insert checklist items into owned or shared projects with write access" ON checklist_items;
DROP POLICY IF EXISTS "Users can update checklist items of owned or shared projects with write access" ON checklist_items;
DROP POLICY IF EXISTS "Users can delete checklist items of owned or shared projects with write access" ON checklist_items;


-- 2. Create clean, unqualified policies

-- Nodes policies
CREATE POLICY "Users can view nodes of owned or shared projects"
  ON nodes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email'
      )
    )
  ));

CREATE POLICY "Users can insert nodes into owned or shared projects with write access"
  ON nodes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ));

CREATE POLICY "Users can update nodes of owned or shared projects with write access"
  ON nodes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ));

CREATE POLICY "Users can delete nodes of owned or shared projects with write access"
  ON nodes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ));


-- Edges policies
CREATE POLICY "Users can view edges of owned or shared projects"
  ON edges FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email'
      )
    )
  ));

CREATE POLICY "Users can insert edges into owned or shared projects with write access"
  ON edges FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ));

CREATE POLICY "Users can update edges of owned or shared projects with write access"
  ON edges FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ));

CREATE POLICY "Users can delete edges of owned or shared projects with write access"
  ON edges FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ));


-- Checklist Items policies
CREATE POLICY "Users can view checklist items of owned or shared projects"
  ON checklist_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM nodes n
    JOIN projects p ON n.project_id = p.id
    WHERE n.id = node_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email'
      )
    )
  ));

CREATE POLICY "Users can insert checklist items into owned or shared projects with write access"
  ON checklist_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM nodes n
    JOIN projects p ON n.project_id = p.id
    WHERE n.id = node_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ));

CREATE POLICY "Users can update checklist items of owned or shared projects with write access"
  ON checklist_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM nodes n
    JOIN projects p ON n.project_id = p.id
    WHERE n.id = node_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM nodes n
    JOIN projects p ON n.project_id = p.id
    WHERE n.id = node_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ));

CREATE POLICY "Users can delete checklist items of owned or shared projects with write access"
  ON checklist_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM nodes n
    JOIN projects p ON n.project_id = p.id
    WHERE n.id = node_id AND (
      p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM project_shares ps
        WHERE ps.project_id = p.id AND ps.user_email = auth.jwt()->>'email' AND ps.permission = 'write'
      )
    )
  ));
