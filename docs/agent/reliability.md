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
- Prefer one-time server-stored state over client-stored signed state when replay resistance matters.
- Do durable writes before optional side effects whenever possible.

## Review Triggers

- External APIs
- Background work
- Writes with side effects
- Long-running requests
- Auth replay recovery
- Distributed throttling or challenge storage

## Watch Fors

- Partial success paths that can leave durable state without a usable session.
- Retry logic that can create duplicate writes, duplicate subscriptions, or stale success replay.
- Canonical state checks that differ between login, refresh, and protected reads.
- Side effects that happen before the audit row or domain write is durable.

## Preferred Techniques

- Use replay ledgers or idempotency keys for post-commit session recovery.
- Use outbox-style thinking for emails and other non-critical side effects.
- Make auth and payment retries deterministic and safe to replay.
- Keep timeout behavior explicit and consistent across all third-party calls.
