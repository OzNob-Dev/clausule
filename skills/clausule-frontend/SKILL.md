---
name: clausule-frontend
description: Clausule frontend guidance for React, Next.js screens, components, hooks, styles, accessibility, mobile behavior, design direction, frontend state, data fetching, and render performance. Use when changing files in src/app UI routes, src/features UI modules, src/shared UI, client hooks, CSS, Tailwind, or frontend tests.
---

# Clausule Frontend

## First Checks

- Keep `src/app/*/page.jsx` thin and route-specific.
- Reuse local feature styles and components before creating shared primitives.
- Meet AAA accessibility, preserve focus states, and verify keyboard paths for interactive UI.
- Use links for navigation and buttons for actions.
- Do not ship controls that imply persistence, uploads, alerts, checkout, or reminders unless the backend contract exists.

## Accessibility

- Prefer native `form`, `button`, `input`, `textarea`, `dialog`, `fieldset`, and `legend` over ARIA stand-ins.
- Use explicit `aria-*` only when native semantics are insufficient.
- Custom dialogs require initial focus, focus trap, `Escape`, inert background, and focus return. Use the shared `Modal` portal unless there is a compelling reason.
- If `Modal` has `title={null}`, provide `labelledBy` and `describedBy`. Confirmation inputs still need real labels.
- Tabs, switches, OTP inputs, dropzones, and drag/drop widgets must match APG keyboard behavior.
- Prefer native button/checkbox switches. Do not ship clickable `div` switches.
- Avoid `contentEditable` for form-like editing. Prefer styled native inputs/textarea.
- Preserve `AppShell` skip nav and `<main id="main-content">`.
- Multi-column boards need `role="group"` and descriptive `aria-label` on each column wrapper.
- Every `<button>` inside or near a form must have explicit `type`.
- Field labels must be `<label htmlFor={id}>`. Toggle groups need `role="group"` and `aria-pressed`.

## Data and State

- Use React Query for server-state reads. Query functions live in `src/shared/queries/`.
- Use `apiFetch` or `jsonRequest` from `src/shared/utils/api.js` as transport.
- Mutations use `useMutation`; invalidate affected query keys or update cache with `queryClient.setQueryData`.
- Gate hidden tabs/drawers with `enabled` so they do not fetch before opened.
- For fetches inside `useEffect`, use `AbortController`, pass `signal`, abort in cleanup, and skip all state updates for `AbortError`.
- `useProfileStore` is the user/profile/security source of truth. `AuthContext` owns only router-dependent side effects.
- Collapse related `useProfileStore` reads into one selector.
- Convert never-updated `useState` values to constants.
- Use `useTrackedTimeout` instead of raw timeout refs.
- Use reducers for hooks with 5 or more related state variables or state-machine flows.
- In `// @ts-check` JSX files, type the whole reducer surface before TS migration.
- Derived list/filter/display computations should use `useMemo`; callbacks passed to memoized list items should use `useCallback`.

## UI Integrity

- If durable backend state is missing, render an unavailable or coming-soon state.
- Local-only drafts must say they are local-only. Never call timer-driven UI "autosaved" unless data survives refresh and route changes.
- Hide unsupported uploads, reminders, checkout, and payment inputs.
- Do not use global names like `window`, `document`, `name`, or `status` as props or params.
- Do not call `startTransition` inside `setTimeout`. Wrap the state setter synchronously.
- Use CSS custom properties for dynamic per-item colors instead of inline style objects.
- For fixed animation delays in fixed-length lists, prefer Tailwind arbitrary-value classes over per-item inline style objects.
- Shared CSS tokens live in `src/shared/styles/tokens.css`; add new palette, radius, or font constants there before spreading literals across route styles.

## Performance

- Use `startTransition` for non-urgent tab switches, step changes, filters, and sorts.
- Use `useDeferredValue` for large controlled-display lists, and wrap deferred filtering/grouping in `useMemo`.
- Defer heavy route-level components with `next/dynamic`; use `ssr: false` only for browser-only render APIs.
- Use stable model IDs for reorderable/filterable lists. `key={index}` is only for stable, non-reorderable lists.
- Fixture/mock objects in `src/shared/data/` need `id` fields.

## Design and Mobile

- For design tasks, act as a principal product designer with 20 years of experience.
- Make screens intentional and distinctive without reducing clarity, readability, performance, or accessibility.
- Preserve established design language when extending an existing area.
- Treat phones and small tablets as first-class targets. Avoid fixed-width assumptions, clipped content, hover-only affordances, and horizontal scrolling.
- Keep touch targets forgiving and primary actions reachable where practical.
- Use motion sparingly and always respect `prefers-reduced-motion`.
- Looping animations require `motion-safe:`.
- `ThinkingDots` is decorative and must appear with visible loading text.

## Known Anchors

- Shared helpers: `profileDisplayName`, `profileInitials`, `fieldClass`, `areaClass`, reminder constants.
- Demo data in `src/shared/data/employees.js` is for tests, prototypes, or stories only.
- Error boundaries: `src/app/error.jsx`, `src/app/(protected)/error.jsx`, `src/app/global-error.jsx`.
- Brag entries keep local state seeded from server props; keep `cardFromEntry` and `cardFromSavedEntry` separate and guard missing mutation `entry`.
- Client array boundaries must handle `null` with `?? []`, not only default params.

## Audit Mode

- When asked to audit frontend, React, TypeScript, components, hooks, or styling, act as a principal frontend engineer with 20 years of production experience. Flag antipatterns, redundancies, outdated patterns, type risks, performance risks, and accessibility gaps. Return P0-P3 findings with file paths and line numbers.
