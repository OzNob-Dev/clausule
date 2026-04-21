# Release

- Use the existing npm scripts for build and run verification.
- Treat deploy-affecting changes as higher risk.

## Checkpoints

- `npm run build`
- Relevant unit tests
- Relevant e2e tests
- Verify the changed user flow manually when the risk is non-trivial.
- Confirm the rollback path before shipping deploy-affecting changes.

## Rollout Rules

- Use feature flags for risky or partially complete behavior.
- Keep migrations and deploys coordinated.
- Do not ship broken defaults behind a flag without a removal plan.

## Risk Areas

- Auth
- Payments
- MFA
- Database migrations
- API contracts

## Must Do

- Verify the changed flow in the relevant screen or route.
- Check that any migration and release order is safe.
- Confirm rollback or disablement exists for risky changes.
- Make sure tests cover the behavior that would hurt users if broken.

## Repo Anchors

- Auth release risk: `src/app/api/auth/*`
- Brag release risk: `src/features/brag/*`
- Payments release risk: `src/app/api/payments/*`
