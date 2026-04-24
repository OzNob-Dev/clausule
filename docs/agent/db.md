# Database

- Prefer explicit schema guarantees over application-only assumptions.
- Keep migrations small, reviewable, and forward-only.
- Treat data shape changes as compatibility changes, not internal refactors.

## Watch Fors

- Business-critical invariants enforced only in application code.
- Auth or ownership checks that depend on filters instead of DB policy or constraints.
- Challenge, replay, or limiter tables that are not one-time consumable or cleanup-safe.
- Dual sources of truth for the same identity field without reconciliation.
- Migration chains that are ambiguous, destructive, or hard to replay safely.

## Preferred Techniques

- Put correctness-critical mutations behind transactional functions or RPCs.
- Use constraints, partial unique indexes, and normalized types for identity and state.
- Keep challenge and replay state server-owned, short-lived, and safely deletable.
- Add cleanup functions or scheduled cleanup for expiring auth and retry state.
- Keep row-level access rules aligned with actual ownership semantics.

## Review Triggers

- Any schema change touching auth, identity, payments, retries, or ownership.
- Any new table that stores secrets, challenges, tokens, or side-effect state.
- Any migration that changes write semantics, cleanup behavior, or access policy.
- Any change that adds indexes, uniqueness rules, or new canonical fields.
