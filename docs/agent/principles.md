# Principles

- Optimize for correctness, clarity, and long-term change safety.
- Prefer the least complex solution that satisfies current and near-term needs.
- Introduce abstractions only when they remove real duplication or reduce measurable risk.

## Decision Rules

- Choose explicitness over cleverness.
- Prefer local reasoning over hidden side effects.
- Keep ownership boundaries clear.
- Treat behavior changes as product decisions, not just implementation details.

## Tradeoffs

- Increase complexity only when it clearly buys maintainability, safety, or speed.
- When there is a tension between speed and quality, protect correctness and reversibility.
- If a change affects multiple layers, make the smallest coherent change set.

## Escalate When

- The change introduces new data shape, auth behavior, or rollout risk.
- The change requires a new abstraction that affects multiple domains.
- The safe option is not obvious.

## Repo Anchors

- Brag flows: `src/features/brag/*`
- Auth and MFA: `src/app/api/auth/*` and `src/features/mfa/*`
- Manager flows: `src/features/manager/*`
- Shared primitives: `src/shared/*`
