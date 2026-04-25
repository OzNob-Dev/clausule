---
name: clausule-testing-release
description: Clausule testing, review, feature flag, verification, and release guidance. Use when adding or updating unit, integration, or e2e tests; reviewing changes; choosing verification commands; introducing feature flags; preparing deployment; or assessing release risk.
---

# Clausule Testing Release

## Commands

- Unit and integration: `npm run test`
- Watch: `npm run test:watch`
- E2E: `npm run test:e2e`
- Full suite: `npm run test:all`
- Build: `npm run build`

## Test Expectations

- Prefer targeted tests near changed code.
- Keep unit, integration, and e2e coverage aligned with user-facing behavior.
- Cover behavior changes, error paths, auth/security edge cases, and critical flows.
- Preserve existing accessibility assertions.
- For auth hardening, cover service-level verification and route-level replay/session recovery.
- Custom widgets must test keyboard behavior and focus movement, not just clicks or ARIA attributes.
- Dialog tests should assert open focus, `Escape`, focus containment/trap, focus return, and background inerting where practical.
- Semantic table changes should assert `table`, `columnheader`, and `rowheader` roles.
- Components using React Query must render under `QueryClientProvider`; prefer `src/shared/test/renderWithQueryClient.jsx`.
- Keep the query wrapper stable across `rerender()`.
- Replacing `contentEditable` needs tests for accessible textboxes and absence of editable `contenteditable="true"` nodes.
- Removing fake persistence, checkout, uploads, or reminders needs tests proving misleading controls are absent.
- Lazy query surfaces need tests proving hidden tabs do not fetch until opened and show failure states after enablement.
- Timer-driven UI needs a regression that rerenders or changes owning props mid-flight.
- E2E config must not hard-code a base URL or port that can drift from the dev server.

## Security and Reliability Coverage

- Test first success and retry after partial failure.
- Test one-time challenge consumption, duplicate-submit rejection, durable-before-side-effect ordering, and conflict-safe retries.
- Cover transient lookup failures so refresh/signup/checkout paths do not misclassify them as user-not-found.
- Treat malformed WebAuthn, token, and callback payloads as required security tests.
- Add production-config tests for WebAuthn RP/origin resolution and log sanitization for AI or external-provider errors.
- For auth/SSO tests, mock both DB reads and upstream identity/admin lookups.
- Test canonical account-state parity across OTP, TOTP, passkey, refresh, and bootstrap flows.

## Review Bar

- For testing, review, rollout, and release tasks, act as a principal engineer with 20 years of production experience.
- Lead reviews with findings ordered by severity.
- Focus on correctness, risk, hidden coupling, user impact, security/privacy, and missing tests.
- Reject ambiguous or unbounded changes, app-only assumptions for auth/payment/identity, unclear replay behavior, side effects before durable commit, and UI that promises unavailable persistence/deletion/uploads/alerts/payments.
- Ensure behavior is intentional, error paths are covered, tradeoffs are explicit, and contracts remain compatible.

## Feature Flags

- Use flags to reduce rollout risk, not to postpone decisions.
- Keep scope narrow, defaults safe, owner clear, and expiry documented.
- Remove stale flags after rollout.
- Prefer feature flags for risky product behavior, kill switches, backend behavior changes, and experimental workflows.

## Release Checks

- Run the relevant tests and `npm run build` for deploy-affecting changes.
- Manually verify the changed user flow when risk is non-trivial.
- Confirm rollback or disablement for risky changes.
- Coordinate migrations and deploy order.
- Do not ship broken defaults behind a flag without a removal plan.

## Audit Mode

- When asked to audit tests, coverage, or quality assurance, act as a principal engineer. Flag false confidence from mocked internals, happy-path-only security coverage, attribute-only accessibility tests, and missing runtime semantics. Return a prioritized action plan.
