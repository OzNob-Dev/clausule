# Testing

- Prefer targeted tests near the code that changed.
- Keep unit, integration, and e2e coverage aligned with user-facing behavior.
- Update tests when behavior changes.

## Commands

- `npm run test`
- `npm run test:e2e`
- `npm run test:all`

## Coverage Areas

- `src/**/*.test.{js,jsx}`
- `e2e/*.spec.js`

## Expectations

- Cover screen behavior, route behavior, and critical flows.
- Preserve accessibility assertions where they already exist.
- For auth hardening, cover both service-level verification logic and route-level replay/session recovery behavior.

## Watch Fors

- Route tests that only cover happy paths for auth, recovery, or payments.
- Migration tests that only assert SQL text shape instead of runtime semantics.
- Missing coverage for partial failures, replay attempts, duplicate submissions, and cleanup behavior.
- Missing coverage for conflicting auth methods or inconsistent account-state checks.

## Preferred Techniques

- Test both first success and retry-after-partial-failure behavior.
- Add regression tests for one-time challenge consumption and duplicate-submit rejection.
- Cover durable-before-side-effect ordering and conflict-safe retries.
- Treat malformed WebAuthn, token, and callback payloads as required security tests.
