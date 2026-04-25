# Backend

- Keep handlers thin and push business rules into server-side services.
- Treat auth, input validation, rate limits, and permissions as boundary concerns.
- Normalize and validate all request data before side effects.
- Keep response shapes stable unless contract changes are deliberate.

## Watch Fors

- Auth-method bypasses where one sign-in path can silently skip another required factor.
- Multi-step writes that acknowledge success before durable state is complete.
- Session issuance paths that are not replay-safe after a partial failure.
- Existing-account reuse in signup or checkout flows without verifying allowed auth state.
- Server helpers that drift into client concerns or UI shaping.
- Login or refresh paths that re-implement account-active logic instead of reusing the canonical predicate.
- Dynamic route params interpolated directly into PostgREST filter strings without validation or encoded query builders.

## Preferred Techniques

- Use staged identity proof: verify ownership first, then decide the next allowed auth step.
- Use one recoverable session path for all login-like entrypoints.
- Keep a single canonical account-state check and reuse it everywhere.
- Make write flows idempotent or explicitly conflict-safe.
- Isolate privileged database access behind a small server-only layer.
- Verify third-party identity tokens server-side before trusting any decoded claims.
- Build Supabase/PostgREST queries with `URLSearchParams` or equivalent encoding helpers instead of raw string concatenation.

## Review Triggers

- Any auth, session, signup, recovery, payment, or MFA change.
- Any write path with retries, side effects, or background cleanup.
- Any new external dependency or long-running network call.
- Any route that changes authorization scope, response shape, or durable state.
- Any SSO callback or token-exchange change that starts trusting new claims from an upstream identity provider.
