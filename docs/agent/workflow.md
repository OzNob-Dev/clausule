# Workflow

- Start with the smallest useful context from the files that directly own the change.
- Prefer local edits over broad refactors.
- Keep the immediate path unblocked before exploring side work.

## Decision Flow

- Confirm the nearest owning file or module.
- Check the matching topic docs before changing behavior.
- Make the narrowest coherent change.
- Add or update tests with the behavior change.

## Escalate When

- The change crosses data, auth, privacy, or deploy boundaries.
- The safe implementation is unclear.
- The request conflicts with repo guidance or existing behavior.

## Output Discipline

- Report only what materially matters.
- Prefer concrete file references over generic summaries.
- Keep follow-up questions specific and bounded.

## Repo Anchors

- If the change touches a screen, inspect the paired tests in `*.test.jsx`.
- If the change touches an API route, inspect the matching `route.test.js`.
- If the change touches a migration, inspect the dependent API and UI files too.
