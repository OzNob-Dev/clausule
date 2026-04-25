# Frontend

- Use client components only when interactivity requires them.
- Keep route pages thin and delegate UI to feature screens.
- Preserve existing component patterns in `src/features/*`.

## Accessibility

- Keep semantic landmarks, labels, and keyboard support intact.
- Prefer explicit `aria-*` only when native semantics are insufficient.
- Maintain visible focus states and predictable tab order.
- Use native `form`, `button`, `input`, `dialog`, `fieldset`, and `legend` elements before reaching for `div` + ARIA stand-ins.
- Treat custom dialogs as full focus-management work: initial focus, focus trap, `Escape`, inert background, and focus return are required.
- Treat tabs, switches, OTP inputs, and dropzones as composite widgets that must match APG keyboard behavior, not just visual state.
- Avoid `contentEditable` for form-like editing unless there is no practical alternative and the screen-reader and keyboard story is explicitly tested.
- `AppShell` includes a skip-nav link (`href="#main-content"`) and the `<main>` has `id="main-content"`. Preserve both when editing layout.

## UI Rules

- Reuse local feature styles before adding new shared styles.
- Keep component props small and focused.
- Prefer readable state names and minimal branching.
- Use links or anchors for navigation and buttons for actions.
- Prefer native form submission over click-only save handlers when the UI is collecting user input.

## Shared Utilities

- Profile display helpers: `src/shared/utils/profile.js` — `profileDisplayName`, `profileInitials`
- Form field class strings: `src/shared/constants/classNames.js` — `fieldClass`, `areaClass`
- Reminder constants: `src/shared/constants/reminders.js` — `REMINDER_METHODS`, `REMINDER_FREQUENCIES`
- Demo/fixture data: `src/shared/data/employees.js` — `ALL_EMP`, `SAMPLE_ENTRIES`, `MOCK_RESULTS`, `FLAGGED_EMPLOYEES`

## Data Fetching

- Use `@tanstack/react-query` for all server-state reads. Query functions go in `src/shared/queries/`.
- Keep `apiFetch` / `jsonRequest` from `src/shared/utils/api.js` as the transport layer.
- Do not use raw `fetch()` inside components or hooks for GET requests that benefit from caching.
- Mutations (POST/PATCH/DELETE) may use `apiFetch` directly or via React Query `useMutation`.
- `apiFetch` handles 401 → token refresh internally. React Query's global `retry: 1` is on top of that; prefer `{ retry: false }` per-query for auth endpoints that should fail fast.

## State Management

- User identity lives in `useProfileStore` (Zustand) — the single source of truth.
- `AuthContext` owns only router-dependent side effects (logout redirect). Do not add new state there.
- `useProfileStore` exposes: `user`, `profile`, `security`, `setUser`, `setProfile`, `setSecurity`, `updateUser`, `clearProfile`.
- Multi-step flows (sign-in, MFA setup) use parallel `step` string + boolean flags. Prefer a discriminated union `type Step = 'email' | 'otp' | 'totp' | ...` when adding new steps so the compiler can narrow state.

## Error Boundaries

- `src/app/error.jsx` — recoverable error boundary for all non-root segments.
- `src/app/(protected)/error.jsx` — protected-route error boundary; preserves the session.
- `src/app/global-error.jsx` — root-layout fallback (must include `<html>` and `<body>`).
- Add an `error.jsx` alongside any route segment that does async data loading and could throw.
- Do not remove these files. If a route needs custom error UI, co-locate a segment-level `error.jsx` rather than patching the shared ones.

## Performance

- Wrap non-urgent state updates (tab switches, step transitions, filter changes) in `startTransition` so input stays responsive on slow devices.
- For heavy route-level components (KanbanBoard, ResumeTab, TotpSetupPanel), use `next/dynamic` with `ssr: false` to defer their bundle.
- Memoize list-item callbacks with `useCallback` before passing to `React.memo`-wrapped children in high-density lists (KanbanBoard columns, entry lists).
- `key={index}` is acceptable only for stable, non-reorderable lists (OTP digit rows). Use a data-model ID as key for any editable or sortable list.

## Examples In This Repo

- Brag screens: `src/features/brag/*`
- Manager screens: `src/features/manager/*`
- Auth and MFA: `src/features/auth/*` and `src/features/mfa/*`

## Must Do

- Keep `src/app/*/page.jsx` thin and route-specific.
- Preserve tab order, labels, and focus states in every interactive screen.
- Reuse feature-local styles before introducing new shared UI primitives.
- Do not ship faux accessibility: if a component advertises `role="dialog"`, `role="tab"`, `role="switch"`, or `role="button"`, it must implement the full interaction model.
- Do not inline duplicate utility logic — check `src/shared/utils/` and `src/shared/constants/` first.

## Code Audits

When the word **audit** appears in any instruction relating to frontend, React, TypeScript, components, hooks, or styling:

**You are acting as a Principal Frontend Engineer with 20 years of production experience.** Approach every finding as though you are the most senior engineer on the team — responsible for the integrity, performance, and long-term health of the codebase. Your bar is high: you have seen every antipattern, you know why it fails at scale, and you will not let it ship.

Audit scope — for every component, hook, utility, and type definition, identify:

1. **Antipatterns** — prop drilling beyond 3 levels without Context, `useEffect` with missing or wrong dependencies, inline object/function props recreated on every render, effects that should be events (e.g. `useEffect` triggered by a user action rather than a sync), mutable refs used as derived state, unnecessary `useMemo`/`useCallback` wrapping cheap operations, state that can be derived inline.

2. **Redundancies** — duplicate types or interfaces, repeated utility logic across files, over-abstracted components used in only one place, unnecessary wrapper `<div>`s, duplicate style strings, redundant re-exports.

3. **Outdated patterns** — `React.FC` usage, default exports on shared UI primitives, inline styles for values reachable via Tailwind or CSS custom properties, manual `fetch()` for GET requests that belong in React Query, missing `satisfies` for config objects, `mounted` state anti-pattern when lazy `useState` init suffices, `Date.now()` / `Math.random()` as element keys or IDs when `crypto.randomUUID()` is available.

4. **TypeScript issues** — `any` or `@ts-ignore` without justification, type assertions (`as X`) where type guards are possible, missing strict null checks, loose generic constraints, discriminated unions absent where state machines exist, `strict: false` in tsconfig.

5. **Performance and accessibility** — missing `key` on list items, missing or wrong `aria-*` attributes, non-semantic interactive elements (`<div onClick>`), decorative SVGs without `aria-hidden`, missing `lazy()` / `dynamic()` for heavy route-level components, no `Suspense` fallback, unnecessary re-renders at root level.

Produce a **prioritised action plan** — P0 (blocks correctness/safety), P1 (high impact, widespread), P2 (medium), P3 (low/polish) — with file paths and line numbers for every finding.
