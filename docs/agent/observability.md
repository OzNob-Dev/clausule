# Observability

- Log enough to debug, not enough to expose sensitive data.
- Prefer structured, searchable, and low-noise logs.
- Make failure states visible and actionable.

## Rules

- Include stable identifiers in logs where useful.
- Do not log secrets, tokens, or unnecessary PII.
- Keep error messages specific enough for debugging and safe for users.
- Add tracing or metrics only when they solve a real operational gap.

## Good Signals

- Auth failures
- Validation failures
- Dependency failures
- Unexpected empty states

## Repo Anchors

- `src/app/api/_lib/auth.js` for auth state and cookie handling
- `src/app/api/_lib/supabase.js` for database request failures
- `src/features/brag/server/appFeedback.js` for feedback send/list paths
- `src/app/api/ai/draft-summary/route.js` for upstream failures
