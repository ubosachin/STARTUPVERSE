# StartupVerse

Production-shaped startup networking platform built with Next.js 15, React 19, TypeScript, Tailwind CSS, Clerk, Supabase, Stripe, and OpenAI.

## Architecture

- `app/(marketing)` contains public pages.
- `app/(platform)` contains authenticated platform routes.
- `components/*` is feature-based UI by product area.
- `lib/supabase`, `lib/clerk`, `lib/actions`, `lib/hooks`, `lib/types`, and `lib/utils` contain integration and domain logic.
- `database/schema`, `database/migrations`, and `database/seed` contain the Supabase PostgreSQL setup.

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Add Clerk, Supabase, Stripe, and OpenAI keys.
3. Run `npm install`.
4. Run `npm run dev`.

The app includes demo-mode guards so it can build without live service keys. Clerk authentication, Supabase writes, Stripe webhooks, and OpenAI analysis become active when the relevant environment variables are configured.

## Database

Run `database/schema/001_initial_schema.sql` in Supabase, then apply `database/migrations/202606080002_rls_policies.sql` and optionally `database/seed/seed.sql`.
