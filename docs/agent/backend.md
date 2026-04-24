# Backend

- API routes live in `src/app/api/*`.
- Shared route helpers live in `src/app/api/_lib`.
- Feature server logic lives in `src/features/*/server`.

## Rules

- Require auth before touching user-scoped data.
- Validate and normalize request data before side effects.
- Return consistent JSON shapes and HTTP status codes.
- Keep route handlers thin; move business logic into server modules.
- Log only what is needed for debugging and never leak secrets.
- Treat auth, rate limits, and permission checks as boundary concerns, not business logic.
- Prefer explicit failure responses over silent fallback behavior.
- Keep server-only integrations isolated from client-facing modules.

## Reliability

- Make mutations idempotent where practical.
- Use clear retry guidance for throttled or transient failures.
- Abort long-running requests when the client disconnects.
- Put multi-step consistency-critical writes behind DB functions or other atomic boundaries instead of acknowledging partial success.

## Patterns

- `GET` reads data
- `POST` creates data
- `PATCH` updates data
- `DELETE` removes data

## Review Triggers

- Auth or session changes
- New external integrations
- Non-trivial input validation
- Data-shaping or pagination logic
- Any route that writes data

## Good Fits

- `src/app/api/feedback/route.js`
- `src/app/api/brag/entries/[id]/route.js`
- `src/features/brag/server/entries.js`

## Must Do

- Check `src/app/api/_lib/auth.js` before changing any auth behavior.
- Keep `src/app/api/_lib/supabase.js` the only path to service-role database access.
- Verify user-scoped routes against `requireAuth` and the matching tests.
- Keep response bodies compatible with current callers unless migration is deliberate.

## Anti-Patterns

- Putting business rules directly in route files
- Returning raw database errors to clients
- Adding silent retries around writes
- Mixing client-only code into server helpers
