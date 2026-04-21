# Reliability

- Design for partial failure, retries, and idempotency.
- Use timeouts and abort paths for network calls.
- Keep critical mutations safe to repeat or safely reject duplicates.

## Rules

- Fail closed on auth and authorization.
- Return clear errors for recoverable failures.
- Avoid hidden retries that can duplicate writes.
- Preserve user state across transient failures when possible.

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
