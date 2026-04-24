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

## Repo Anchors

- `src/features/brag/BragEmployeeScreen.test.jsx`
- `src/features/brag/components/EntryComposer.test.jsx`
- `src/app/api/auth/verify-code/route.test.js`
- `src/app/api/feedback/route.test.js`
- `e2e/auth-and-brag.spec.js`
