-- ==========================================
-- NodeIDs — Sharing migration (Nivel 1)
-- Run this in your Supabase SQL Editor to update
-- ==========================================

-- 1. Create project_shares table

create table if not exists project_shares (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  user_email text not null,
  permission text not null check (permission in ('read', 'write')),
  created_at timestamptz not null default now()
);

-- Evitar duplicados del mismo email en el mismo proyecto
create unique index if not exists project_shares_project_id_user_email_idx 
  on project_shares(project_id, user_email);

-- Activar RLS
alter table project_shares enable row level security;


-- 2. Drop old policies

-- Projects
drop policy if exists "Users can view their own projects" on projects;

-- Nodes
drop policy if exists "Users can view nodes of their own projects" on nodes;
drop policy if exists "Users can insert nodes into their own projects" on nodes;
drop policy if exists "Users can update nodes of their own projects" on nodes;
drop policy if exists "Users can delete nodes of their own projects" on nodes;

-- Edges
drop policy if exists "Users can view edges of their own projects" on edges;
drop policy if exists "Users can insert edges into their own projects" on edges;
drop policy if exists "Users can update edges of their own projects" on edges;
drop policy if exists "Users can delete edges of their own projects" on edges;

-- Checklist items
drop policy if exists "Users can view checklist items of their own projects" on checklist_items;
drop policy if exists "Users can insert checklist items into their own projects" on checklist_items;
drop policy if exists "Users can update checklist items of their own projects" on checklist_items;
drop policy if exists "Users can delete checklist items of their own projects" on checklist_items;


-- 3. Define new collaborative RLS Policies

-- Project Shares Table
create policy "Owners can manage project shares"
  on project_shares for all
  using (exists (
    select 1 from projects p 
    where p.id = project_shares.project_id and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from projects p 
    where p.id = project_shares.project_id and p.owner_id = auth.uid()
  ));

create policy "Invited users can view shares of projects shared with them"
  on project_shares for select
  using (user_email = auth.jwt()->>'email' or exists (
    select 1 from projects p
    where p.id = project_shares.project_id and p.owner_id = auth.uid()
  ));

-- Projects table (viewing)
create policy "Users can view projects they own or are shared with"
  on projects for select
  using (
    auth.uid() = owner_id or exists (
      select 1 from project_shares ps
      where ps.project_id = projects.id and ps.user_email = auth.jwt()->>'email'
    )
  );

-- Nodes policies (viewing and modifying)
create policy "Users can view nodes of owned or shared projects"
  on nodes for select
  using (exists (
    select 1 from projects p
    where p.id = nodes.project_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email'
      )
    )
  ));

create policy "Users can insert nodes into owned or shared projects with write access"
  on nodes for insert
  with check (exists (
    select 1 from projects p
    where p.id = nodes.project_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ));

create policy "Users can update nodes of owned or shared projects with write access"
  on nodes for update
  using (exists (
    select 1 from projects p
    where p.id = nodes.project_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ))
  with check (exists (
    select 1 from projects p
    where p.id = nodes.project_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ));

create policy "Users can delete nodes of owned or shared projects with write access"
  on nodes for delete
  using (exists (
    select 1 from projects p
    where p.id = nodes.project_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ));

-- Edges policies (viewing and modifying)
create policy "Users can view edges of owned or shared projects"
  on edges for select
  using (exists (
    select 1 from projects p
    where p.id = edges.project_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email'
      )
    )
  ));

create policy "Users can insert edges into owned or shared projects with write access"
  on edges for insert
  with check (exists (
    select 1 from projects p
    where p.id = edges.project_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ));

create policy "Users can update edges of owned or shared projects with write access"
  on edges for update
  using (exists (
    select 1 from projects p
    where p.id = edges.project_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ))
  with check (exists (
    select 1 from projects p
    where p.id = edges.project_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ));

create policy "Users can delete edges of owned or shared projects with write access"
  on edges for delete
  using (exists (
    select 1 from projects p
    where p.id = edges.project_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ));

-- Checklist Items policies (viewing and modifying)
create policy "Users can view checklist items of owned or shared projects"
  on checklist_items for select
  using (exists (
    select 1 from nodes n
    join projects p on n.project_id = p.id
    where n.id = checklist_items.node_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email'
      )
    )
  ));

create policy "Users can insert checklist items into owned or shared projects with write access"
  on checklist_items for insert
  with check (exists (
    select 1 from nodes n
    join projects p on n.project_id = p.id
    where n.id = checklist_items.node_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ));

create policy "Users can update checklist items of owned or shared projects with write access"
  on checklist_items for update
  using (exists (
    select 1 from nodes n
    join projects p on n.project_id = p.id
    where n.id = checklist_items.node_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ))
  with check (exists (
    select 1 from nodes n
    join projects p on n.project_id = p.id
    where n.id = checklist_items.node_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ));

create policy "Users can delete checklist items of owned or shared projects with write access"
  on checklist_items for delete
  using (exists (
    select 1 from nodes n
    join projects p on n.project_id = p.id
    where n.id = checklist_items.node_id and (
      p.owner_id = auth.uid() or exists (
        select 1 from project_shares ps
        where ps.project_id = p.id and ps.user_email = auth.jwt()->>'email' and ps.permission = 'write'
      )
    )
  ));
