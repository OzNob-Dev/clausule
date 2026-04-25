# Workflow

- Load only the specific function block being modified and its direct imports first, not the entire file.
- Prefer local edits over broad refactors.
- Keep the immediate path unblocked before exploring side work.

## Decision Flow

- Confirm the nearest owning file or module.
- Check the matching topic docs before changing behavior.
- Do not refactor code outside of the immediate function being fixed. If a fix requires changes across more than 3 files, propose a plan first.
- Add or update tests with the behavior change.

## Escalate When

- The change crosses data schemas, auth logic, privacy rules, or deployment configs.
- The safe implementation is unclear.
- The request conflicts with repo guidance or existing behavior.
- Ask for clarification ONLY if the request modifies database schemas, changes public API contracts, or if a required dependency is missing.
- A task is likely to run for a long time; pause first and share an estimated duration before proceeding.

## Output Discipline

- Only report the names of files changed and any manual steps the user must take.
- Prefer concrete file references over generic summaries.
- Keep follow-up questions specific and bounded.

## Repo Anchors

- If the change touches a screen, inspect the paired tests in `*.test.jsx`.
- If the change touches an API route, inspect the matching `route.test.js`.
- If the change touches a migration, inspect the dependent API and UI files too.

## Build Notes

- Treat `next build` as two separate signals: compile/type validity first, then page-data collection. If compile and type-check pass but the build fails later because required env vars are missing, report that as an environment blocker instead of undoing unrelated code changes.
