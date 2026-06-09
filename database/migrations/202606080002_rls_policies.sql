alter table users enable row level security;
alter table profiles enable row level security;
alter table startups enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table reactions enable row level security;
alter table followers enable row level security;
alter table connections enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table matches enable row level security;
alter table funding_rounds enable row level security;
alter table investor_interests enable row level security;
alter table events enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table notifications enable row level security;
alter table subscriptions enable row level security;

create policy "public profiles are readable" on profiles for select using (true);
create policy "public startups are readable" on startups for select using (true);
create policy "public posts are readable" on posts for select using (visibility = 'public');
create policy "public events are readable" on events for select using (true);
create policy "public jobs are readable" on jobs for select using (true);

-- Service-role clients used by Next.js route handlers bypass RLS.
-- Add authenticated Supabase JWT policies after mapping Clerk session tokens to Supabase JWTs.
