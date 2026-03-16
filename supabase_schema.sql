-- SmartAssist Chatbot — Supabase Schema
-- Run this in the Supabase SQL Editor

-- 1. Sessions table
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table sessions enable row level security;

-- 2. Tracking events table
create table if not exists tracking_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  node_id text not null,
  choice_path text[] default '{}',
  created_at timestamptz default now()
);

alter table tracking_events enable row level security;

create index if not exists idx_tracking_events_session_id
  on tracking_events(session_id);

-- 3. Leads table
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

alter table leads enable row level security;

create index if not exists idx_leads_session_id
  on leads(session_id);
