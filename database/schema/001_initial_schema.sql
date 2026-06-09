-- ============================================================
-- StartupVerse PostgreSQL Schema
-- Run in Supabase SQL Editor or psql
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── ENUM Types ────────────────────────────────────────────────
create type user_role as enum ('founder', 'investor', 'cofounder', 'builder', 'advisor', 'admin');
create type subscription_tier as enum ('free', 'founder_pro', 'investor_pro', 'startup_pro', 'enterprise');
create type connection_status as enum ('pending', 'accepted', 'rejected', 'blocked');
create type startup_stage as enum ('idea', 'pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'growth', 'public');
create type funding_round_type as enum ('pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'bridge', 'strategic', 'ipo');
create type funding_round_status as enum ('planning', 'active', 'closed', 'paused');
create type deal_stage as enum ('contacted', 'interested', 'meeting', 'due-diligence', 'term-sheet', 'committed', 'passed');
create type job_type as enum ('full-time', 'part-time', 'contract', 'internship', 'co-founder');
create type location_type as enum ('remote', 'hybrid', 'on-site');
create type event_type as enum ('virtual', 'in-person', 'hybrid');
create type post_type as enum ('text', 'image', 'video', 'article', 'milestone', 'job', 'event');
create type notification_type as enum ('match', 'message', 'connection', 'funding', 'reaction', 'comment', 'startup', 'system');
create type report_status as enum ('pending', 'reviewed', 'resolved', 'dismissed');

-- ── Users (synced from Clerk via webhook) ────────────────────
create table users (
  id          uuid primary key default uuid_generate_v4(),
  clerk_id    text unique not null,
  email       text unique not null,
  username    text unique not null,
  role        user_role not null default 'builder',
  subscription_tier subscription_tier not null default 'free',
  is_admin    boolean not null default false,
  is_verified boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Profiles ──────────────────────────────────────────────────
create table profiles (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references users(id) on delete cascade,
  full_name     text not null,
  headline      text,
  bio           text,
  avatar_url    text,
  banner_url    text,
  location      text,
  website       text,
  linkedin_url  text,
  twitter_url   text,
  github_url    text,
  skills        text[] default '{}',
  industries    text[] default '{}',
  looking_for   text[] default '{}',
  is_open_to_cofounder boolean default false,
  is_open_to_investment boolean default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(user_id)
);

-- ── Startups ──────────────────────────────────────────────────
create table startups (
  id               uuid primary key default uuid_generate_v4(),
  founder_id       uuid not null references users(id) on delete cascade,
  name             text not null,
  slug             text unique not null,
  tagline          text not null,
  description      text,
  industry         text not null,
  stage            startup_stage not null default 'pre-seed',
  funding_stage    text,
  logo_url         text,
  banner_url       text,
  website          text,
  linkedin_url     text,
  twitter_url      text,
  github_url       text,
  location         text,
  founded_year     integer,
  team_size        integer default 1,
  business_model   text,
  tech_stack       text[] default '{}',
  is_hiring        boolean default false,
  is_verified      boolean default false,
  is_featured      boolean default false,
  followers_count  integer default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Startup team members ──────────────────────────────────────
create table startup_members (
  id          uuid primary key default uuid_generate_v4(),
  startup_id  uuid not null references startups(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  role        text not null,
  is_founder  boolean default false,
  joined_at   timestamptz not null default now(),
  unique(startup_id, user_id)
);

-- ── Investors ─────────────────────────────────────────────────
create table investors (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references users(id) on delete cascade,
  firm_name           text,
  investment_thesis   text,
  focus_areas         text[] default '{}',
  preferred_stages    text[] default '{}',
  check_size_min      text,
  check_size_max      text,
  portfolio_companies text[] default '{}',
  lead_investor       boolean default false,
  board_member        boolean default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(user_id)
);

-- ── Funding Rounds ────────────────────────────────────────────
create table funding_rounds (
  id              uuid primary key default uuid_generate_v4(),
  startup_id      uuid not null references startups(id) on delete cascade,
  round_type      funding_round_type not null,
  target_amount   bigint not null,
  amount_raised   bigint not null default 0,
  valuation       bigint,
  equity_percent  numeric(5,2),
  status          funding_round_status not null default 'planning',
  close_date      date,
  deck_url        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Investor Deal Flow ────────────────────────────────────────
create table deals (
  id              uuid primary key default uuid_generate_v4(),
  investor_id     uuid not null references users(id) on delete cascade,
  startup_id      uuid not null references startups(id) on delete cascade,
  round_id        uuid references funding_rounds(id) on delete set null,
  stage           deal_stage not null default 'contacted',
  notes           text,
  amount_interest bigint,
  next_action     text,
  next_action_date date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(investor_id, startup_id)
);

-- ── Connections ───────────────────────────────────────────────
create table connections (
  id           uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references users(id) on delete cascade,
  addressee_id uuid not null references users(id) on delete cascade,
  status       connection_status not null default 'pending',
  message      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (requester_id != addressee_id),
  unique(requester_id, addressee_id)
);

-- ── Posts ─────────────────────────────────────────────────────
create table posts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references users(id) on delete cascade,
  startup_id      uuid references startups(id) on delete set null,
  post_type       post_type not null default 'text',
  content         text not null,
  media_urls      text[] default '{}',
  tags            text[] default '{}',
  visibility      text not null default 'public',
  likes_count     integer not null default 0,
  comments_count  integer not null default 0,
  reposts_count   integer not null default 0,
  saves_count     integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Post reactions ────────────────────────────────────────────
create table post_reactions (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references posts(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  type       text not null default 'like',
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

-- ── Comments ──────────────────────────────────────────────────
create table comments (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references posts(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  content    text not null,
  parent_id  uuid references comments(id) on delete cascade,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── Saved Posts ───────────────────────────────────────────────
create table saved_posts (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references posts(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

-- ── Follows ───────────────────────────────────────────────────
create table follows (
  id           uuid primary key default uuid_generate_v4(),
  follower_id  uuid not null references users(id) on delete cascade,
  following_id uuid not null references users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  check(follower_id != following_id),
  unique(follower_id, following_id)
);

-- ── Startup follows ───────────────────────────────────────────
create table startup_follows (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references users(id) on delete cascade,
  startup_id uuid not null references startups(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, startup_id)
);

-- ── Messages / Conversations ──────────────────────────────────
create table conversations (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table conversation_participants (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id         uuid not null references users(id) on delete cascade,
  last_read_at    timestamptz,
  primary key (conversation_id, user_id)
);

create table messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references users(id) on delete cascade,
  content         text not null,
  media_url       text,
  is_read         boolean default false,
  created_at      timestamptz not null default now()
);

-- ── Matches ───────────────────────────────────────────────────
create table matches (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references users(id) on delete cascade,
  matched_user_id     uuid not null references users(id) on delete cascade,
  score               integer not null,
  skill_score         integer,
  vision_score        integer,
  relevance_score     integer,
  status              text not null default 'pending',
  created_at          timestamptz not null default now(),
  check(user_id != matched_user_id),
  unique(user_id, matched_user_id)
);

-- ── Jobs ──────────────────────────────────────────────────────
create table jobs (
  id                 uuid primary key default uuid_generate_v4(),
  startup_id         uuid not null references startups(id) on delete cascade,
  title              text not null,
  description        text not null,
  type               job_type not null default 'full-time',
  location_type      location_type not null default 'remote',
  location           text,
  salary_min         integer,
  salary_max         integer,
  equity_min         numeric(5,2),
  equity_max         numeric(5,2),
  skills_required    text[] default '{}',
  is_active          boolean default true,
  applications_count integer default 0,
  created_at         timestamptz not null default now()
);

-- ── Job applications ──────────────────────────────────────────
create table job_applications (
  id         uuid primary key default uuid_generate_v4(),
  job_id     uuid not null references jobs(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  cover_note text,
  status     text not null default 'submitted',
  created_at timestamptz not null default now(),
  unique(job_id, user_id)
);

-- ── Events ────────────────────────────────────────────────────
create table events (
  id               uuid primary key default uuid_generate_v4(),
  organizer_id     uuid not null references users(id) on delete cascade,
  startup_id       uuid references startups(id) on delete set null,
  title            text not null,
  description      text,
  event_type       event_type not null default 'virtual',
  category         text not null default 'networking',
  location         text,
  meeting_url      text,
  start_date       timestamptz not null,
  end_date         timestamptz,
  max_attendees    integer,
  attendees_count  integer default 0,
  is_published     boolean default true,
  created_at       timestamptz not null default now()
);

-- ── Event RSVPs ───────────────────────────────────────────────
create table event_rsvps (
  id         uuid primary key default uuid_generate_v4(),
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- ── Notifications ─────────────────────────────────────────────
create table notifications (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references users(id) on delete cascade,
  type         notification_type not null,
  title        text not null,
  message      text not null,
  action_url   text,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ── Subscriptions (Stripe) ────────────────────────────────────
create table subscriptions (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references users(id) on delete cascade,
  stripe_customer_id   text unique,
  stripe_subscription_id text unique,
  plan                 subscription_tier not null default 'free',
  status               text not null default 'active',
  current_period_start timestamptz,
  current_period_end   timestamptz,
  cancel_at_period_end boolean default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── Content Reports ───────────────────────────────────────────
create table reports (
  id          uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references users(id) on delete cascade,
  target_type text not null,  -- 'post' | 'user' | 'startup' | 'comment'
  target_id   uuid not null,
  reason      text not null,
  notes       text,
  status      report_status not null default 'pending',
  reviewed_by uuid references users(id),
  created_at  timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────
create index idx_users_clerk_id on users(clerk_id);
create index idx_users_username on users(username);
create index idx_profiles_user_id on profiles(user_id);
create index idx_startups_slug on startups(slug);
create index idx_startups_founder on startups(founder_id);
create index idx_startups_stage on startups(stage);
create index idx_posts_user on posts(user_id);
create index idx_posts_created on posts(created_at desc);
create index idx_messages_conversation on messages(conversation_id, created_at);
create index idx_notifications_user on notifications(user_id, read, created_at desc);
create index idx_connections_requester on connections(requester_id);
create index idx_connections_addressee on connections(addressee_id);
create index idx_deals_investor on deals(investor_id);
create index idx_deals_startup on deals(startup_id);
create index idx_jobs_startup on jobs(startup_id);
create index idx_matches_user on matches(user_id, score desc);

-- ── Updated_at trigger ────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at before update on users
  for each row execute function update_updated_at();
create trigger set_profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
create trigger set_startups_updated_at before update on startups
  for each row execute function update_updated_at();
create trigger set_funding_rounds_updated_at before update on funding_rounds
  for each row execute function update_updated_at();
create trigger set_deals_updated_at before update on deals
  for each row execute function update_updated_at();
create trigger set_investors_updated_at before update on investors
  for each row execute function update_updated_at();
create trigger set_conversations_updated_at before update on conversations
  for each row execute function update_updated_at();
