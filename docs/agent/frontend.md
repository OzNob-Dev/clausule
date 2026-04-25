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
- Custom dialogs should render through the shared `Modal` portal unless there is a compelling reason not to. Feature-local overlays drift on focus, inerting, and scroll locking too easily.
- Treat tabs, switches, OTP inputs, and dropzones as composite widgets that must match APG keyboard behavior, not just visual state.
- For `role="switch"`, prefer a native `<button type="button" role="switch">` or checkbox. Do not ship clickable `div` switches with hand-rolled key handlers.
- Avoid `contentEditable` for form-like editing unless there is no practical alternative and the screen-reader and keyboard story is explicitly tested.
- Prefer styled native `input` / `textarea` controls over `contentEditable` even for document-like surfaces (resume builders, structured notes, inline profile sections). Match the visual design in CSS; do not trade away selection, labeling, IME support, and testability.
- `AppShell` includes a skip-nav link (`href="#main-content"`) and the `<main>` has `id="main-content"`. Preserve both when editing layout.

## UI Rules

- Reuse local feature styles before adding new shared styles.
- Keep component props small and focused.
- Prefer readable state names and minimal branching.
- Use links or anchors for navigation and buttons for actions.
- Prefer native form submission over click-only save handlers when the UI is collecting user input.
- Do not use inline `style={{ backgroundColor: x, color: y }}` objects for dynamic per-item values (avatar colors, status badges, kanban card accents). Use a single CSS custom property instead: `style={{ '--av-bg': bg, '--av-col': col }}` and reference `var(--av-bg)` in the stylesheet. This avoids new object references every render and keeps Tailwind purging intact.

## Shared Utilities

- Profile display helpers: `src/shared/utils/profile.js` — `profileDisplayName`, `profileInitials`
- Form field class strings: `src/shared/constants/classNames.js` — `fieldClass`, `areaClass`
- Reminder constants: `src/shared/constants/reminders.js` — `REMINDER_METHODS`, `REMINDER_FREQUENCIES`
- Demo/fixture data: `src/shared/data/employees.js` — `ALL_EMP`, `SAMPLE_ENTRIES`, `MOCK_RESULTS`, `FLAGGED_EMPLOYEES`

## Data Fetching

- Use `@tanstack/react-query` for all server-state reads. Query functions go in `src/shared/queries/`.
- Keep `apiFetch` / `jsonRequest` from `src/shared/utils/api.js` as the transport layer.
- Do not use raw `fetch()` inside components or hooks for GET requests that benefit from caching.
- React Query v5 query hooks should not rely on legacy per-query lifecycle callbacks like `onSuccess`/`onError`. Read `query.data` / `query.error` from the caller and sync derived local state in `useEffect` only when unavoidable.
- Mutations (POST/PATCH/DELETE) must use React Query `useMutation`, not raw `apiFetch`. After a successful mutation, call `queryClient.invalidateQueries` for affected query keys so the cache stays consistent. Direct `apiFetch` calls in feature hooks bypass retry, loading state, and cache invalidation — do not introduce new ones.
- If a mutation only needs to append or replace already-fetched local server state (for example, prepending a newly created feedback thread), update the cache with `queryClient.setQueryData` instead of duplicating the server state in local component `useState`.
- `apiFetch` handles 401 → token refresh internally. React Query's global `retry: 1` is on top of that; prefer `{ retry: false }` per-query for auth endpoints that should fail fast.
- When fetching inside `useEffect`, always use `AbortController` — pass `signal` to `fetch`, and call `controller.abort()` in the cleanup function. Do **not** use an `alive` boolean flag: it prevents state updates but does not cancel the in-flight request, and `finally` still fires after unmount. Skip all state updates when `error.name === 'AbortError'` — do not call `setLoading` either.

```js
useEffect(() => {
  const controller = new AbortController()
  fetch('/api/endpoint', { signal: controller.signal })
    .then((r) => r.ok ? r.json() : fallback)
    .then((data) => {
      setState(data)
      setLoading(false)
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        setState(fallback)
        setLoading(false)
      }
    })
  return () => controller.abort()
}, [])
```

## State Management

- User identity lives in `useProfileStore` (Zustand) — the single source of truth.
- `AuthContext` owns only router-dependent side effects (logout redirect). Do not add new state there. Do not read `user` or `loading` from `AuthContext` — read from `useProfileStore` directly.
- `useProfileStore` exposes: `user`, `profile`, `security`, `setUser`, `setProfile`, `setSecurity`, `updateUser`, `clearProfile`.
- Multi-step flows (sign-in, MFA setup) use parallel `step` string + boolean flags. Prefer a discriminated union `type Step = 'email' | 'otp' | 'totp' | ...` when adding new steps so the compiler can narrow state.
- When a hook manages 5 or more related state variables for a state machine (auth flow, MFA setup, signup), use `useReducer` with a discriminated union action type instead of parallel `useState` calls. This prevents impossible intermediate states (e.g. `loading=true` + `error` set simultaneously) that parallel `useState` cannot prevent.
- During the JS → TS migration, add JSDoc typedef imports from `src/shared/types/contracts.ts` to reducer-driven hooks and contexts before renaming everything to `.ts`/`.tsx`. This keeps the shared contracts connected to real frontend state machines instead of drifting into unused types.
- Auto-verify on code completion (e.g. OTP digit fill) is implemented as a `useEffect` watching `digits` and `state`. This is acceptable **only** when the effect has a state guard (`if (code.state !== 'idle') return`) that prevents double-fire. The guard works because verification sets `state` to `'checking'` synchronously before the async call, so the effect exits on re-run. Do not remove these guards.
- Hooks that compute derived values from state (filtered lists, changed-field sets, display strings) must wrap those computations in `useMemo`. Recomputing inline creates a new reference every render, which breaks `React.memo` bailouts downstream and triggers unnecessary re-renders in any hook subscriber.

## Error Boundaries

- `src/app/error.jsx` — recoverable error boundary for all non-root segments.
- `src/app/(protected)/error.jsx` — protected-route error boundary; preserves the session.
- `src/app/global-error.jsx` — root-layout fallback (must include `<html>` and `<body>`).
- Add an `error.jsx` alongside any route segment that does async data loading and could throw.
- Do not remove these files. If a route needs custom error UI, co-locate a segment-level `error.jsx` rather than patching the shared ones.

## Performance

- Wrap non-urgent state updates (tab switches, step transitions, filter changes) in `startTransition` so input stays responsive on slow devices.
- For heavy route-level components (KanbanBoard, ResumeTab, TotpSetupPanel), use `next/dynamic` with a loading fallback to defer their bundle. Add `ssr: false` only when the module requires browser-only APIs during render.
- Memoize list-item callbacks with `useCallback` before passing to `React.memo`-wrapped children in high-density lists (KanbanBoard columns, entry lists).
- `key={index}` is acceptable only for stable, non-reorderable lists (OTP digit rows). Use a stable data-model `id` as key for any other list — never use a display string like `name` as a key, even if it appears unique, because uniqueness is not enforced.
- All fixture/mock objects in `src/shared/data/` must include an `id` field so list keys are stable.

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
