# Observability

- Log enough to debug, not enough to expose sensitive data.
- Prefer structured, searchable, and low-noise logs.
- Make failure states visible and actionable.

## Rules

- Include stable identifiers in logs where useful.
- Do not log secrets, tokens, or unnecessary PII.
- Keep error messages specific enough for debugging and safe for users.
- Add tracing or metrics only when they solve a real operational gap.
- Keep client-facing errors stable even when server logs stay detailed.

## Good Signals

- Auth failures
- Validation failures
- Dependency failures
- Unexpected empty states
- Replay detection
- Cleanup failures

## Watch Fors

- Raw upstream or database errors leaking into client responses.
- Logs that mix failure classes, making incidents hard to group.
- Silent cleanup failures for challenge, replay, token, or limiter state.

## Preferred Techniques

- Use stable log prefixes or fields by subsystem and failure class.
- Distinguish validation, dependency, authorization, and data-consistency failures.
- Log enough context to debug retries and replay behavior without logging secrets.
