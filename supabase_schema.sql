-- ==========================================
-- NodeIDs Database Schema & RLS Policies
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create tables

-- Projects table
create table if not exists projects (
  id text primary key,
  name text not null,
  description text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nodes table (representing nodes on the canvas)
create table if not exists nodes (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  type text not null default 'customNode',
  position_x numeric not null,
  position_y numeric not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Edges table (connections between nodes)
create table if not exists edges (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  source text not null references nodes(id) on delete cascade,
  target text not null references nodes(id) on delete cascade,
  source_handle text,
  target_handle text,
  type text not null default 'smoothstep',
  animated boolean not null default false,
  data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Checklist items table (child tasks of specific nodes)
create table if not exists checklist_items (
  id text primary key,
  node_id text not null references nodes(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- 2. Enable Row Level Security (RLS)

alter table projects enable row level security;
alter table nodes enable row level security;
alter table edges enable row level security;
alter table checklist_items enable row level security;


-- 3. Define RLS Policies

-- Projects policies
create policy "Users can view their own projects" 
  on projects for select 
  using (auth.uid() = owner_id);

create policy "Users can insert their own projects" 
  on projects for insert 
  with check (auth.uid() = owner_id);

create policy "Users can update their own projects" 
  on projects for update 
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own projects" 
  on projects for delete 
  using (auth.uid() = owner_id);

-- Nodes policies
create policy "Users can view nodes of their own projects" 
  on nodes for select 
  using (exists (
    select 1 from projects p 
    where p.id = nodes.project_id and p.owner_id = auth.uid()
  ));

create policy "Users can insert nodes into their own projects" 
  on nodes for insert 
  with check (exists (
    select 1 from projects p 
    where p.id = nodes.project_id and p.owner_id = auth.uid()
  ));

create policy "Users can update nodes of their own projects" 
  on nodes for update 
  using (exists (
    select 1 from projects p 
    where p.id = nodes.project_id and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from projects p 
    where p.id = nodes.project_id and p.owner_id = auth.uid()
  ));

create policy "Users can delete nodes of their own projects" 
  on nodes for delete 
  using (exists (
    select 1 from projects p 
    where p.id = nodes.project_id and p.owner_id = auth.uid()
  ));

-- Edges policies
create policy "Users can view edges of their own projects" 
  on edges for select 
  using (exists (
    select 1 from projects p 
    where p.id = edges.project_id and p.owner_id = auth.uid()
  ));

create policy "Users can insert edges into their own projects" 
  on edges for insert 
  with check (exists (
    select 1 from projects p 
    where p.id = edges.project_id and p.owner_id = auth.uid()
  ));

create policy "Users can update edges of their own projects" 
  on edges for update 
  using (exists (
    select 1 from projects p 
    where p.id = edges.project_id and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from projects p 
    where p.id = edges.project_id and p.owner_id = auth.uid()
  ));

create policy "Users can delete edges of their own projects" 
  on edges for delete 
  using (exists (
    select 1 from projects p 
    where p.id = edges.project_id and p.owner_id = auth.uid()
  ));

-- Checklist Items policies
create policy "Users can view checklist items of their own projects" 
  on checklist_items for select 
  using (exists (
    select 1 from nodes n 
    join projects p on n.project_id = p.id 
    where n.id = checklist_items.node_id and p.owner_id = auth.uid()
  ));

create policy "Users can insert checklist items into their own projects" 
  on checklist_items for insert 
  with check (exists (
    select 1 from nodes n 
    join projects p on n.project_id = p.id 
    where n.id = checklist_items.node_id and p.owner_id = auth.uid()
  ));

create policy "Users can update checklist items of their own projects" 
  on checklist_items for update 
  using (exists (
    select 1 from nodes n 
    join projects p on n.project_id = p.id 
    where n.id = checklist_items.node_id and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from nodes n 
    join projects p on n.project_id = p.id 
    where n.id = checklist_items.node_id and p.owner_id = auth.uid()
  ));

create policy "Users can delete checklist items of their own projects" 
  on checklist_items for delete 
  using (exists (
    select 1 from nodes n 
    join projects p on n.project_id = p.id 
    where n.id = checklist_items.node_id and p.owner_id = auth.uid()
  ));


-- 4. Triggers to automatically update updated_at

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_projects_updated_at
  before update on projects
  for each row execute function update_updated_at_column();

create trigger update_nodes_updated_at
  before update on nodes
  for each row execute function update_updated_at_column();

create trigger update_edges_updated_at
  before update on edges
  for each row execute function update_updated_at_column();

create trigger update_checklist_items_updated_at
  before update on checklist_items
  for each row execute function update_updated_at_column();
