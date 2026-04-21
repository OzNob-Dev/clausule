# Code Style

- Match the repo’s existing style in the touched area.
- Keep modules small, explicit, and easy to scan.
- Prefer meaningful names over clever compression.

## Structure

- One responsibility per file when practical.
- Group helper logic near the feature that uses it.
- Use shared utilities only when reused across domains.

## JS and React

- Favor early returns over nested branching.
- Prefer small pure helpers for data shaping.
- Keep hooks and effects focused on one concern.
- Avoid unnecessary abstraction in component trees.

## Review Checks

- Is the code easy to follow on first read?
- Is the ownership boundary obvious?
- Is duplication worth extracting yet?
- Will future changes be local or sprawling?

## Repo Anchors

- `src/features/brag/BragEmployeeScreen.jsx`
- `src/features/brag/components/EntryComposer.jsx`
- `src/app/api/auth/refresh/route.js`
- `src/features/manager/settings/SettingsScreen.jsx`
