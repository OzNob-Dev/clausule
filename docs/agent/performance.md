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
- Prefer `useDeferredValue` over throttling when the source input must stay controlled but the filtered list can lag slightly behind.
- **`useDeferredValue` only defers re-renders — it does not skip inline computations.** Any `.filter()`, `.reduce()`, or grouping logic that runs inline in the render body still executes synchronously every render regardless of deferral. Wrap all derived computations that depend on a deferred value in `useMemo([deferredValue])`. Without `useMemo`, the deferral has no effect on CPU cost.

  ```js
  // Wrong — filter runs on every render, deferral wasted
  const deferredQuery = useDeferredValue(query)
  const filtered = ALL_EMP.filter((e) => e.name.includes(deferredQuery))

  // Correct — React skips the memo when deferredQuery hasn't resolved yet
  const deferredQuery = useDeferredValue(query)
  const filtered = useMemo(
    () => ALL_EMP.filter((e) => e.name.includes(deferredQuery.trim().toLowerCase())),
    [deferredQuery]
  )
  ```

## Lazy Loading

- Heavy route-level components that are not on the initial paint path should use `next/dynamic`:
  - `KanbanBoard` (manager dashboard)
  - `ResumeTab` (brag CV view)
  - `TotpSetupPanel` (MFA setup)
- Pattern: `const KanbanBoard = dynamic(() => import('./KanbanBoard'), { loading: () => <Fallback /> })`
- Reserve `ssr: false` for components that touch browser-only APIs during render. Bundle-splitting alone does not require client-only rendering.

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
