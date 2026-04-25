# Performance

- Optimize for perceived speed first, then raw throughput.
- Watch bundle size, render cost, and network round trips.
- Measure before optimizing when the risk is unclear.

## Rules

- Avoid unnecessary client components and client-side work.
- Keep expensive work off the critical path.
- Cache only when the invalidation story is clear.
- Prefer incremental improvements over large speculative rewrites.

## Transitions

- Use `startTransition` for non-urgent state: tab switches, step changes, filter/sort updates. This keeps inputs and button clicks responsive while the new UI renders.
- Use `useDeferredValue` for derived display values from large lists (e.g. filtered entry lists).

## Lazy Loading

- Heavy route-level components that are not on the initial paint path should use `next/dynamic`:
  - `KanbanBoard` (manager dashboard)
  - `ResumeTab` (brag CV view)
  - `TotpSetupPanel` (MFA setup)
- Pattern: `const KanbanBoard = dynamic(() => import('./KanbanBoard'), { ssr: false })`

## List Rendering

- `key={index}` is acceptable only for lists that are never reordered and never have items removed from the middle (e.g. OTP digit rows). Use a stable data-model ID for all other lists.
- `ResumeDocument` bullets currently use `key={index}` — acceptable because bullets are only appended/removed, not reordered. If reorder is added, the data model must include stable IDs.
- Memoize callbacks passed to `React.memo`-wrapped list items with `useCallback`. Without this, `React.memo` has no effect.

## Review Triggers

- Large UI lists
- Slow routes
- Repeated fetches
- Heavy client bundles

## Repo Anchors

- `src/features/brag/BragEmployeeScreen.jsx` for panel swapping and list rendering
- `src/features/manager/dashboard/KanbanBoard.jsx` for board density
- `src/features/mfa/components/DigitRow.jsx` for input interaction cost
