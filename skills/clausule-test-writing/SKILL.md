---
name: clausule-test-writing
description: Clausule-specific guidance for writing and organizing tests. Use when adding or restructuring unit, integration, or route-level tests; placing sibling test files; mocking Next.js boundaries; or aligning coverage with repo testing conventions.
---

# Clausule Test Writing

## Core Rule

- Put tests next to the code they cover.
- Prefer sibling files like `Component.test.jsx`, `route.test.js`, or `page.test.jsx`.
- Do not create broad catch-all test files when a folder has multiple components, pages, or route handlers.

## Placement

- UI components: one sibling test per component.
- App Router pages, layouts, loading files, and error boundaries: one sibling test beside the file.
- API route handlers: add a sibling `route.test.js` in the same route folder.
- Helpers, hooks, and server modules: add a sibling test when the module owns meaningful logic.

## Coverage Priorities

- Test user-visible behavior before implementation details.
- Cover success, failure, disabled, retry, and malformed-input paths.
- For auth and security flows, cover replay or retry behavior after partial failure.
- Add regressions for timers, redirects, state machines, one-time tokens, callback flows, and lazy-enabled queries.
- Preserve accessibility checks for roles, labels, focus movement, and keyboard behavior where relevant.

## App Router Patterns

- Wrapper pages and layouts should usually mock imported screens and assert only the behavior owned by the wrapper.
- For `page.jsx`, `layout.jsx`, `loading.jsx`, `error.jsx`, and `not-found.jsx`, keep tests narrow.
- If a file only delegates to another screen, mock the screen and assert render or props.
- If a file redirects, assert the redirect path instead of retesting the downstream page.
- `NextResponse.redirect()` may return `307` by default even when business logic thinks in terms of `302`.

## API Route Patterns

- Mock service boundaries like auth guards, server modules, and rate-limit helpers.
- Assert request parsing, forwarded params, status codes, JSON bodies, and redirect locations.
- For auth-gated routes, test both auth failure and happy-path branches.
- For mutating routes, include malformed or empty-body handling when the route uses `request.json().catch(() => ({}))`.

## Mocking Rules

- In Vitest, mocks referenced inside `vi.mock()` should use `vi.hoisted(...)` when hoisting matters.
- Mock only the boundary around the file under test.
- For Next.js page or layout tests, mock `next/navigation`, server auth helpers, and imported screens as needed.
- Mock `next/font/google` when testing the root app layout.
- When a component uses `next/dynamic`, mock the dynamic boundary instead of loading the real client-only dependency.

## React Testing Patterns

- Prefer Testing Library queries by role, label, and visible text.
- Keep tests centered on behavior and contracts, not class names.
- Use `userEvent` for user interaction.
- Components using React Query should render under the repo query wrapper.
- When a component only depends on a simple child contract, prefer a minimal mock over a full integration setup.

## Folder Conventions

### `src/shared/components/ui`

- Every component should have its own sibling test file.
- Avoid aggregate folder-wide coverage files.

### `src/actions` and `src/auth`

- Prefer one sibling test per module.
- Cover service-level behavior directly, not only through routes.

### `src/app`

- Add sibling tests for wrappers, route handlers, pages, layouts, and meaningful helpers.
- For public, auth, and protected route-group files, test only the behavior owned by that file.
- For app API helpers like JWT, session, TOTP, and network utilities, keep tests deterministic and small.

## Verification

- Run targeted tests for the files you changed before running larger suites.
- If a broader suite fails because of known pre-existing failures, call that out separately from the new work.
- Do not claim a folder is fully green unless the relevant focused run actually passed.

## Anti-Patterns

- Do not add one giant test file for an entire component folder.
- Do not over-mock so much that redirects, statuses, or forwarded params are never asserted.
- Do not skip failure paths for auth, API, or stateful hooks.
- Do not rely on snapshots as the main form of coverage for behavior-heavy code.
