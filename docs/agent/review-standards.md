# Review Standards

- Review changes for correctness, risk, and hidden coupling.
- Prefer findings that point to user impact, not style alone.
- Treat missing tests as a real gap when behavior changes.

## Bar

- Behavior is intentional and documented.
- Error paths are covered.
- Security and privacy impacts are checked.
- Tradeoffs are explicit.

## Reject When

- The change is ambiguous or unbounded.
- A risky path is not explained.
- Tests do not cover the changed behavior where practical.
- Auth, payment, or identity changes rely on app-only assumptions instead of explicit invariants.
- One sign-in path can bypass another required sign-in method.
- Side effects can fire before durable state is committed.
- Retry or replay behavior is unclear, unbounded, or untested.

## Focus Areas

- Canonical source of truth for identity and account state.
- DB-enforced ownership, uniqueness, and one-time consumption.
- Replay-safe session issuance and conflict-safe writes.
- Distributed abuse controls and bounded external calls.
