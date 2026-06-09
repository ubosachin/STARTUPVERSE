insert into users (id, clerk_id, username, email, role) values
  ('11111111-1111-1111-1111-111111111111', 'demo_founder', 'maya', 'maya@startupverse.demo', 'Founder'),
  ('22222222-2222-2222-2222-222222222222', 'demo_investor', 'sofia', 'sofia@startupverse.demo', 'Investor'),
  ('33333333-3333-3333-3333-333333333333', 'demo_builder', 'nina', 'nina@startupverse.demo', 'CoFounder')
on conflict do nothing;

insert into profiles (user_id, full_name, bio, location, skills) values
  ('11111111-1111-1111-1111-111111111111', 'Maya Chen', 'Founder building programmable payroll for global teams.', 'San Francisco', array['Fintech', 'Payroll', 'GTM']),
  ('22222222-2222-2222-2222-222222222222', 'Sofia Alvarez', 'Seed investor focused on B2B AI, fintech infra, and devtools.', 'San Francisco', array['Investing', 'B2B SaaS', 'AI']),
  ('33333333-3333-3333-3333-333333333333', 'Nina Kapoor', 'Full-stack CTO candidate and AI infra builder.', 'Bengaluru', array['React', 'AI infra', 'Hiring'])
on conflict do nothing;

insert into startups (id, founder_id, name, slug, tagline, description, industry, stage) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'OrbitLedger', 'orbitledger', 'Programmable payroll for global teams', 'Payroll infrastructure for distributed teams.', 'Fintech', 'Seed')
on conflict do nothing;

insert into posts (author_id, content, visibility) values
  ('11111111-1111-1111-1111-111111111111', 'We opened our seed round to expand programmable payroll for global teams.', 'public'),
  ('22222222-2222-2222-2222-222222222222', 'AI infra deals move fastest when the buyer is already inside the workflow.', 'public')
on conflict do nothing;

insert into matches (user_a, user_b, match_type, score) values
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'cofounder', 94),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'investor', 89)
on conflict do nothing;
