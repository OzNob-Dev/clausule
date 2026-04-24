# Reliability

- Design for partial failure, retries, and idempotency.
- Use timeouts and abort paths for network calls.
- Keep critical mutations safe to repeat or safely reject duplicates.
- Prefer durable shared stores over process memory for auth throttles, replay ledgers, and challenge state.

## Rules

- Fail closed on auth and authorization.
- Return clear errors for recoverable failures.
- Avoid hidden retries that can duplicate writes.
- Preserve user state across transient failures when possible.
- Keep auth or recovery codes unverifiable unless the associated delivery step completed successfully.
- Treat third-party email sends like other network calls: bound them with timeouts and log only safe failure details.

## Review Triggers

- External APIs
- Background work
- Writes with side effects
- Long-running requests

## Repo Anchors

- `src/app/api/auth/refresh/route.js` for session rotation
- `src/app/api/auth/check-email/route.js` for rate-limited reads
- `src/features/brag/server/entries.js` for create/update/delete flows
- `src/features/auth/server/sendOtpCode.js` for third-party delivery
