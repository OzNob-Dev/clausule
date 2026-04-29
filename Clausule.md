# Clausule Guidance

- This is the Clausule entrypoint.
- Keep repo-wide rules here.
- Put reusable detailed guidance in `skills/*/SKILL.md`.

## Priority

1. System instructions
2. Developer instructions
3. This file
4. Loaded skill files
5. `docs/agent/*.md` compatibility stubs

## Load Order

- Read this file first.
- Load `skills/clausule-core/SKILL.md` for any code, docs, config, dependency, or convention change.
- For implementation work, also load `skills/clausule-frontend/SKILL.md` so accessibility, UX, mobile, and design constraints shape the build.
- Then load any matching area skill:
  - `skills/clausule-frontend/SKILL.md` for UI, React, hooks, CSS, accessibility, mobile, design, and frontend performance.
  - `skills/clausule-backend-security/SKILL.md` for API routes, server logic, auth, database, privacy, reliability, observability, security, and external integrations.
  - `skills/clausule-testing-release/SKILL.md` for tests, reviews, feature flags, verification, rollout, and release.
  - `skills/clausule-test-writing/SKILL.md` for writing or reorganizing test files, mocking boundaries, and sibling-test placement.
- Use `docs/agent/*.md` only as routing stubs for older agents.

## Change Rules

- Update the matching skill when commands, conventions, or testing patterns change.
- Keep this file and `docs/agent/*.md` short.
- Add new skill folders instead of expanding entrypoint docs with detailed rules.
