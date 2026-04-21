# Overview

- App Router Next.js app with feature-first organization.
- Main code lives in `src/app`, `src/features`, and `src/shared`.
- Keep page shells thin; push feature logic into `src/features/*`.

## Structure

- `src/app`: routes, layouts, and API routes
- `src/features`: domain features and screen-level components
- `src/shared`: reusable UI, hooks, utilities, styles, and data
- `supabase/migrations`: schema and SQL migrations
- `e2e`: Playwright tests

## Conventions

- Prefer the existing path aliases: `@features`, `@shared`, `@api`.
- Keep server helpers under feature/server folders or `src/app/api/_lib`.
- Keep styles close to the feature or shared component they support.
- Match the current accessibility and visual language unless explicitly changing it.
