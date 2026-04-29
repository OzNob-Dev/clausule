---
name: clausule-architecture
description: Clausule App Router, module boundary, route shape, and shared utility guidance. Use for architecture audits, feature ownership, folder layout, middleware, data-flow splits, and cross-domain abstractions.
---

# Clausule Architecture

## Load Order
- Load `skills/clausule-core/SKILL.md` first.
- Load `skills/clausule-frontend/SKILL.md` for UI-adjacent implementation work.
- Use this skill for App Router structure, boundaries, and shared placement.

## Boundary Map
- `src/app/*`: thin route shells only.
- `src/features/*`: feature-owned UI, hooks, and server logic.
- `src/shared/*`: reusable primitives, queries, utilities, and tokens.
- `src/actions/*`: server writes.
- `src/app/api/*`: webhooks, callbacks, and exposed HTTP endpoints.
- `middleware.ts`: edge redirects and pre-render route protection.

## Rules
- Keep pages, layouts, and route handlers thin.
- Put reads in server modules or shared query/service helpers, not internal API calls.
- Put writes in server actions unless an exposed HTTP endpoint is required.
- Keep route groups semantic: public, auth, protected, or feature-specific.
- Move repeated cross-feature behavior into `src/shared`, not `src/app`.
- Preserve alias hygiene. Prefer `@shared`, `@features`, and `@api` where configured.
- Keep `docs/agent/*.md` files short and routing-only.

## Review Triggers
- New or moving route groups.
- Cross-feature abstractions.
- Middleware or auth gating.
- Shared utility placement.
- Data-flow splits between server components, actions, services, and route handlers.
