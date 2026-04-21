# Performance

- Optimize for perceived speed first, then raw throughput.
- Watch bundle size, render cost, and network round trips.
- Measure before optimizing when the risk is unclear.

## Rules

- Avoid unnecessary client components and client-side work.
- Keep expensive work off the critical path.
- Cache only when the invalidation story is clear.
- Prefer incremental improvements over large speculative rewrites.

## Review Triggers

- Large UI lists
- Slow routes
- Repeated fetches
- Heavy client bundles

## Repo Anchors

- `src/features/brag/BragEmployeeScreen.jsx` for panel swapping and list rendering
- `src/features/manager/dashboard/KanbanBoard.jsx` for board density
- `src/features/mfa/components/DigitRow.jsx` for input interaction cost
