# Frontend

- Use client components only when interactivity requires them.
- Keep route pages thin and delegate UI to feature screens.
- Preserve existing component patterns in `src/features/*`.

## Accessibility

- Keep semantic landmarks, labels, and keyboard support intact.
- Prefer explicit `aria-*` only when native semantics are insufficient.
- Maintain visible focus states and predictable tab order.

## UI Rules

- Reuse local feature styles before adding new shared styles.
- Keep component props small and focused.
- Prefer readable state names and minimal branching.

## Examples In This Repo

- Brag screens: `src/features/brag/*`
- Manager screens: `src/features/manager/*`
- Auth and MFA: `src/features/auth/*` and `src/features/mfa/*`

## Must Do

- Keep `src/app/*/page.jsx` thin and route-specific.
- Preserve tab order, labels, and focus states in every interactive screen.
- Reuse feature-local styles before introducing new shared UI primitives.
