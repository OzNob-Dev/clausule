# Error Handling

- Fail fast at the boundary and keep internal errors contained.
- Return safe, actionable messages to users.
- Keep retry behavior explicit and controlled.

## Rules

- Validate before side effects.
- Distinguish validation, auth, transient, and fatal failures.
- Preserve user progress where possible on recoverable failures.
- Use the same failure shape for the same class of problem.

## Good Patterns

- Clear 400s for invalid input
- 401s for auth failure
- 429s with retry guidance for throttling
- 5xxs only when the server cannot recover

## Review Triggers

- Network calls
- Writes
- Background tasks
- Form submissions

## Repo Anchors

- `src/app/api/auth/check-email/route.js` for validation and throttling
- `src/app/api/auth/verify-code/route.js` for 429 and retry guidance
- `src/features/brag/server/entries.js` for CRUD failures
- `src/features/brag/components/EntryComposer.jsx` for save errors
