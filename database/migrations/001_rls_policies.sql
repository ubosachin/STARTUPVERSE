-- ============================================================
-- StartupVerse Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- Uses Clerk JWT: auth.jwt() ->> 'sub' = clerk_id
-- ============================================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table profiles enable row level security;
alter table startups enable row level security;
alter table startup_members enable row level security;
alter table investors enable row level security;
alter table funding_rounds enable row level security;
alter table deals enable row level security;
alter table connections enable row level security;
alter table posts enable row level security;
alter table post_reactions enable row level security;
alter table comments enable row level security;
alter table saved_posts enable row level security;
alter table follows enable row level security;
alter table startup_follows enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table matches enable row level security;
alter table jobs enable row level security;
alter table job_applications enable row level security;
alter table events enable row level security;
alter table event_rsvps enable row level security;
alter table notifications enable row level security;
alter table subscriptions enable row level security;
alter table reports enable row level security;

-- ── Helper function: get current user ID from clerk JWT ──────
create or replace function get_current_user_id()
returns uuid language sql stable security definer as $$
  select id from users where clerk_id = (auth.jwt() ->> 'sub')
$$;

-- ── Helper: check admin ──────────────────────────────────────
create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select coalesce(
    (select is_admin from users where clerk_id = (auth.jwt() ->> 'sub')),
    false
  )
$$;

-- ── USERS ────────────────────────────────────────────────────
-- Anyone can read public user info
create policy "users_select_public" on users
  for select using (true);

-- Only the owner can update their own user record
create policy "users_update_own" on users
  for update using (clerk_id = (auth.jwt() ->> 'sub'));

-- Service role (webhook) can insert
create policy "users_insert_service" on users
  for insert with check (true);

-- Admin can delete
create policy "users_delete_admin" on users
  for delete using (is_admin());

-- ── PROFILES ─────────────────────────────────────────────────
create policy "profiles_select_public" on profiles
  for select using (true);

create policy "profiles_update_own" on profiles
  for update using (user_id = get_current_user_id());

create policy "profiles_insert_own" on profiles
  for insert with check (user_id = get_current_user_id());

-- ── STARTUPS ─────────────────────────────────────────────────
-- All public (published) startups are readable by everyone
create policy "startups_select_public" on startups
  for select using (true);

-- Founder or startup member can update
create policy "startups_update_founder" on startups
  for update using (
    founder_id = get_current_user_id()
    or exists (
      select 1 from startup_members
      where startup_id = startups.id and user_id = get_current_user_id()
    )
  );

create policy "startups_insert_authenticated" on startups
  for insert with check (
    founder_id = get_current_user_id()
  );

create policy "startups_delete_founder_or_admin" on startups
  for delete using (
    founder_id = get_current_user_id() or is_admin()
  );

-- ── STARTUP MEMBERS ──────────────────────────────────────────
create policy "startup_members_select_public" on startup_members
  for select using (true);

create policy "startup_members_insert_founder" on startup_members
  for insert with check (
    exists (
      select 1 from startups where id = startup_id and founder_id = get_current_user_id()
    )
  );

-- ── INVESTORS ────────────────────────────────────────────────
create policy "investors_select_public" on investors
  for select using (true);

create policy "investors_update_own" on investors
  for update using (user_id = get_current_user_id());

create policy "investors_insert_own" on investors
  for insert with check (user_id = get_current_user_id());

-- ── FUNDING ROUNDS ───────────────────────────────────────────
create policy "funding_rounds_select_public" on funding_rounds
  for select using (true);

create policy "funding_rounds_insert_founder" on funding_rounds
  for insert with check (
    exists (
      select 1 from startups
      where id = startup_id and founder_id = get_current_user_id()
    )
  );

create policy "funding_rounds_update_founder" on funding_rounds
  for update using (
    exists (
      select 1 from startups
      where id = startup_id and founder_id = get_current_user_id()
    )
  );

-- ── DEALS ────────────────────────────────────────────────────
create policy "deals_select_own" on deals
  for select using (
    investor_id = get_current_user_id()
    or exists (
      select 1 from startups where id = startup_id and founder_id = get_current_user_id()
    )
  );

create policy "deals_insert_investor" on deals
  for insert with check (investor_id = get_current_user_id());

create policy "deals_update_investor" on deals
  for update using (investor_id = get_current_user_id());

-- ── CONNECTIONS ───────────────────────────────────────────────
create policy "connections_select_own" on connections
  for select using (
    requester_id = get_current_user_id()
    or addressee_id = get_current_user_id()
  );

create policy "connections_insert_authenticated" on connections
  for insert with check (requester_id = get_current_user_id());

create policy "connections_update_addressee" on connections
  for update using (
    addressee_id = get_current_user_id()
    or requester_id = get_current_user_id()
  );

-- ── POSTS ────────────────────────────────────────────────────
create policy "posts_select_public" on posts
  for select using (visibility = 'public' or user_id = get_current_user_id());

create policy "posts_insert_authenticated" on posts
  for insert with check (user_id = get_current_user_id());

create policy "posts_update_own" on posts
  for update using (user_id = get_current_user_id());

create policy "posts_delete_own_or_admin" on posts
  for delete using (user_id = get_current_user_id() or is_admin());

-- ── POST REACTIONS ────────────────────────────────────────────
create policy "reactions_select_public" on post_reactions
  for select using (true);

create policy "reactions_insert_authenticated" on post_reactions
  for insert with check (user_id = get_current_user_id());

create policy "reactions_delete_own" on post_reactions
  for delete using (user_id = get_current_user_id());

-- ── COMMENTS ─────────────────────────────────────────────────
create policy "comments_select_public" on comments
  for select using (true);

create policy "comments_insert_authenticated" on comments
  for insert with check (user_id = get_current_user_id());

create policy "comments_delete_own_or_admin" on comments
  for delete using (user_id = get_current_user_id() or is_admin());

-- ── SAVED POSTS ───────────────────────────────────────────────
create policy "saved_posts_own" on saved_posts
  for all using (user_id = get_current_user_id())
  with check (user_id = get_current_user_id());

-- ── FOLLOWS ──────────────────────────────────────────────────
create policy "follows_select_public" on follows
  for select using (true);

create policy "follows_own" on follows
  for all using (follower_id = get_current_user_id())
  with check (follower_id = get_current_user_id());

-- ── STARTUP FOLLOWS ───────────────────────────────────────────
create policy "startup_follows_select_public" on startup_follows
  for select using (true);

create policy "startup_follows_own" on startup_follows
  for all using (user_id = get_current_user_id())
  with check (user_id = get_current_user_id());

-- ── CONVERSATIONS ─────────────────────────────────────────────
create policy "conversations_select_participant" on conversations
  for select using (
    exists (
      select 1 from conversation_participants
      where conversation_id = conversations.id and user_id = get_current_user_id()
    )
  );

create policy "conversations_insert_authenticated" on conversations
  for insert with check (true);

-- ── CONVERSATION PARTICIPANTS ─────────────────────────────────
create policy "conv_participants_select_own" on conversation_participants
  for select using (user_id = get_current_user_id());

create policy "conv_participants_insert_authenticated" on conversation_participants
  for insert with check (true);

-- ── MESSAGES ─────────────────────────────────────────────────
create policy "messages_select_participant" on messages
  for select using (
    exists (
      select 1 from conversation_participants
      where conversation_id = messages.conversation_id and user_id = get_current_user_id()
    )
  );

create policy "messages_insert_participant" on messages
  for insert with check (
    sender_id = get_current_user_id()
    and exists (
      select 1 from conversation_participants
      where conversation_id = messages.conversation_id and user_id = get_current_user_id()
    )
  );

-- ── MATCHES ──────────────────────────────────────────────────
create policy "matches_select_own" on matches
  for select using (
    user_id = get_current_user_id() or matched_user_id = get_current_user_id()
  );

create policy "matches_insert_service" on matches
  for insert with check (true);

-- ── JOBS ─────────────────────────────────────────────────────
create policy "jobs_select_public" on jobs
  for select using (is_active = true or
    exists (
      select 1 from startups where id = startup_id and founder_id = get_current_user_id()
    )
  );

create policy "jobs_insert_founder" on jobs
  for insert with check (
    exists (select 1 from startups where id = startup_id and founder_id = get_current_user_id())
  );

create policy "jobs_update_founder" on jobs
  for update using (
    exists (select 1 from startups where id = startup_id and founder_id = get_current_user_id())
  );

-- ── JOB APPLICATIONS ─────────────────────────────────────────
create policy "job_apps_select_own" on job_applications
  for select using (user_id = get_current_user_id());

create policy "job_apps_insert_authenticated" on job_applications
  for insert with check (user_id = get_current_user_id());

-- ── EVENTS ───────────────────────────────────────────────────
create policy "events_select_public" on events
  for select using (is_published = true or organizer_id = get_current_user_id());

create policy "events_insert_authenticated" on events
  for insert with check (organizer_id = get_current_user_id());

-- ── EVENT RSVPS ──────────────────────────────────────────────
create policy "event_rsvps_select_public" on event_rsvps
  for select using (true);

create policy "event_rsvps_own" on event_rsvps
  for all using (user_id = get_current_user_id())
  with check (user_id = get_current_user_id());

-- ── NOTIFICATIONS ─────────────────────────────────────────────
create policy "notifications_own" on notifications
  for all using (user_id = get_current_user_id())
  with check (user_id = get_current_user_id());

create policy "notifications_insert_service" on notifications
  for insert with check (true);

-- ── SUBSCRIPTIONS ─────────────────────────────────────────────
create policy "subscriptions_own" on subscriptions
  for select using (user_id = get_current_user_id());

create policy "subscriptions_insert_service" on subscriptions
  for insert with check (true);

create policy "subscriptions_update_service" on subscriptions
  for update using (true);

-- ── REPORTS ───────────────────────────────────────────────────
create policy "reports_insert_authenticated" on reports
  for insert with check (reporter_id = get_current_user_id());

create policy "reports_select_admin" on reports
  for select using (is_admin());

create policy "reports_update_admin" on reports
  for update using (is_admin());
