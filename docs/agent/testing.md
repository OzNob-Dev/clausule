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
- For custom frontend widgets, cover keyboard behavior and focus movement, not just click behavior.
- Dialog tests should assert open focus, `Escape`, focus trap or containment, and focus return when practical.
- Dialog tests should also assert background inerting or equivalent isolation when the dialog system claims `aria-modal` behavior.
- Tab, switch, OTP, and drag-drop tests should assert the keyboard paths promised by their ARIA roles.
- If a React Query screen mirrors query results into a store, add at least one regression test proving the screen reacts to query `data` changes without relying on stale query callbacks.
- Components that call `useQuery` / `useMutation` must render in tests under a `QueryClientProvider`. Reuse `src/shared/test/renderWithQueryClient.jsx` instead of open-coding ad hoc query clients in each test file.
- When replacing `contentEditable` with native form controls, add a regression that asserts the accessible textbox fields exist and that no editable `contenteditable="true"` nodes remain.
- When a screen delegates resend, cancel, or continue handlers through a flow hook, add one wiring test at the screen boundary so prop plumbing cannot silently drift.

## Watch Fors

- Route tests that only cover happy paths for auth, recovery, or payments.
- Migration tests that only assert SQL text shape instead of runtime semantics.
- Missing coverage for partial failures, replay attempts, duplicate submissions, and cleanup behavior.
- Missing coverage for conflicting auth methods or inconsistent account-state checks.
- Missing regressions for soft-deleted account reuse, preflight lookup failures before third-party side effects, or cross-row credential deletion races.
- Stale auth tests that mock `select`/`rpc` paths but forget admin-auth lookups such as `getAuthUser`.
- Route tests that accidentally hit live Supabase helpers because new rate-limit or auth dependencies were added without mocks.
- UI tests that validate ARIA attributes but never exercise the matching keyboard contract.
- Playwright configs that hard-code a base URL or port that can drift from the dev server when the preferred port is occupied.

## Test Audits

When the word **audit** appears in any instruction relating to tests, coverage, or quality assurance:

**You are acting as a Principal Engineer with 20 years of production experience.** Evaluate every test file against the standards below. Flag tests that create false confidence: mocked internals that don't reflect runtime behavior, happy-path-only coverage on security-critical flows, assertions that validate attribute presence but never exercise the matching keyboard or interaction contract. Produce a prioritised action plan.

## Preferred Techniques

- Test both first success and retry-after-partial-failure behavior.
- Add regression tests for one-time challenge consumption and duplicate-submit rejection.
- Cover durable-before-side-effect ordering and conflict-safe retries.
- Add explicit regressions for transient lookup failures so refresh/signup/checkout paths do not misclassify them as user-not-found.
- Treat malformed WebAuthn, token, and callback payloads as required security tests.
- Add production-config tests for WebAuthn RP/origin resolution and log-sanitization tests for AI or external-provider errors.
- For auth/SSO tests, mock both DB reads and upstream identity/admin lookups so the test stays deterministic as account-state logic evolves.
- Add explicit regressions for canonical account-state parity across OTP, TOTP, passkey, refresh, and bootstrap flows.
- Fail fast when e2e web-server startup cannot bind the expected port instead of letting the suite hang until timeout.
