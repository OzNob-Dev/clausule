---
name: clausule-backend-security
description: Clausule backend, API, database, auth, privacy, reliability, observability, and security guidance. Use when changing API routes, server modules, Supabase queries, migrations, auth, MFA, passkeys, SSO, payments, AI/email integrations, logging, retries, PII handling, or external service calls.
---

# Clausule Backend Security

## Boundary Rules

- For backend, API, database, auth, privacy, reliability, observability, or security coding tasks, act as a principal engineer with 20 years of production experience.
- Keep handlers thin. Push business rules into server-side services.
- Validate and normalize request data before side effects.
- Keep request and response shapes stable unless a migration plan exists.
- Return predictable status codes and safe error shapes.
- Treat auth, validation, rate limits, permissions, and external claims as boundary concerns.
- Build Supabase/PostgREST filters with `URLSearchParams` or equivalent encoding helpers, not raw interpolation.
- Treat App Router dynamic route `params` as async.

## Security

- Auth is mandatory for user-scoped endpoints.
- Fail closed on auth and authorization.
- Never commit secrets, expose server-only secrets to client code, or log tokens, secrets, full payloads, or unnecessary PII.
- Preserve cookie flags, token lifetimes, authorization scope, and existing auth failure behavior unless deliberately changing them.
- Treat account, MFA, passkey, WebAuthn, SSO, payment, recovery, AI, and email flows as high risk.
- Keep unauthenticated account-discovery surfaces minimal and generic.
- One-time auth challenges must be server-owned or otherwise one-time consumable.
- Verify upstream identity tokens and WebAuthn assertions cryptographically. Decoding JWT or WebAuthn payloads is not proof.
- WebAuthn registration requires validated registration proof before persisting credentials.
- In production, resolve WebAuthn RP ID and origin from trusted config, not request headers.
- Do not reactivate soft-deleted accounts through signup, checkout, or subscription finalization without an explicit recovery flow.
- Destructive-account UI copy must match the actual mutation path.

## Database

- Prefer explicit schema guarantees over app-only assumptions.
- Keep migrations small, reviewable, forward-only, and compatible with release order.
- Use constraints, partial unique indexes, normalized types, RLS, and transactional RPCs for correctness-critical invariants.
- Put cross-row auth/device rules behind transactional RPCs when simple constraints are not enough.
- Keep challenge, replay, limiter, retry, and cleanup state server-owned, short-lived, one-time consumable, and safely deletable.
- Revoke function execution by default in `public`, then explicitly grant intended RPCs.
- For `SECURITY DEFINER` functions, pin a trusted `search_path` ending with `pg_temp` or use fully qualified names.

## Reliability

- Design writes for partial failure, idempotency, retries, and duplicate-submit rejection.
- Use explicit timeouts and abort paths for network calls.
- Durable writes should happen before optional side effects.
- Keep auth/recovery codes unverifiable unless delivery completed.
- Use replay ledgers or idempotency keys for post-commit session recovery.
- Use outbox-style thinking for email and other non-critical side effects.
- Prefer durable shared stores over process memory for auth throttles, replay ledgers, and challenge state.

## Privacy and Observability

- Treat personal data, credentials, tokens, and user content as sensitive by default.
- Minimize collection, retention, and exposure. Redact PII in logs, tests, screenshots, support output, and analytics.
- Log enough to debug, never enough to expose secrets or raw upstream/database failures to users.
- Use stable log prefixes or fields by subsystem and failure class.
- Distinguish validation, dependency, authorization, data-consistency, transient, and fatal failures.
- Keep client-facing errors stable even when server logs are detailed.

## Config

- Treat env vars as contract. Separate public config from server-only secrets.
- Required production WebAuthn config: `NEXT_PUBLIC_RP_ID` and `NEXT_PUBLIC_ORIGIN`.
- Auth test bypass requires both `NODE_ENV !== 'production'` and `NEXT_PUBLIC_AUTH_TEST_BYPASS === 'employee'`.
- Never set the bypass flag in production.

## Review Triggers

- Auth, session, signup, recovery, payment, MFA, passkey, SSO, AI, or email changes.
- Supabase auth, RLS, migrations, RPCs, cleanup jobs, or new secret/challenge/token tables.
- New external dependencies, webhooks, background work, long-running network calls, or side effects.
- Public/shared endpoint contract changes, pagination/filtering changes, new required fields, cookie/token scope changes, or logging changes.

## Anchors

- API helpers: `src/app/api/_lib/*`
- Auth routes: `src/app/api/auth/*`
- Brag server logic: `src/features/brag/server/*`
- Profile store: `src/features/auth/store/useProfileStore.js`
- Migrations: `supabase/migrations/*`
