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

## Repo Anchors

- API changes: verify `route.test.js` coverage
- Screen changes: verify `*.test.jsx` coverage
- Migration changes: verify dependent route and feature tests
