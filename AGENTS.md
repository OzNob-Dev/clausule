# Agent Guidance

- This is the Codex entrypoint.
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
- For any frontend or backend implementation work, also load `skills/clausule-frontend/SKILL.md` so accessibility, UX, mobile, and design constraints shape the build.
- Then load any additional matching area skill:
  - `skills/clausule-frontend/SKILL.md` for UI, React, hooks, CSS, accessibility, mobile, design, and frontend performance.
  - `skills/clausule-backend-security/SKILL.md` for API routes, server logic, auth, database, privacy, reliability, observability, security, and external integrations.
  - `skills/clausule-testing-release/SKILL.md` for tests, reviews, feature flags, verification, rollout, and release.
- Use `docs/agent/*.md` only as routing stubs for older agents.

## Memory & Context

- **Local Knowledge:** Always read relevant files in the `/context/` folder before starting work.
- **Persistent Memory:** Use the `sqlite` tool to query `context/context.db` for past decisions, session history, or task states.
- **Logic Routing:** If the prompt involves "thoughts," "planning," or "architecture," prioritize high-level strategy over immediate code implementation (Planner Logic).

## Non-Negotiables

- Accessibility first.
- Security first.
- Preserve user work.
- Make minimal safe edits.
- Do not change behavior without loading the owning skill.
- Pause and confirm before likely long-running tasks with an estimated duration.
- When a task is completed, run: `osascript -e 'display notification "Task complete" with title "Codex" sound name "Glass"'`
- Consult `/context/` and `context/context.db` before making any non-trivial suggestions.
- **Automatic Logging:** After every response, you MUST use the `sqlite` tool to log the interaction into the `Messages` table of `context/context.db`.
- **Shortcuts:** Interpret the input "pd" as the "Project Done" command defined in `./skills/clausule-core/SKILL.md`.
- **Lifecycle Tracking:** Automatically `INSERT` tasks as `in_progress` upon plan approval.
- **Manual Completion:** Only use the `pd` shortcut from `skills/clausule-core/SKILL.md` to mark tasks as `completed`.
- **Context First:** Always query `context/context.db` for active `in_progress` tasks at the start of a session.


## Conflict Rules

- More specific skill guidance wins.
- If two skills disagree, follow the one matching the touched file area.
- Ask for clarification only for database schema changes, public API changes, missing dependencies, or long-running work.

## Change Rules

- Update the matching skill when behavior, commands, or conventions change.
- Keep this file and `docs/agent/*.md` short.
- Add new skill folders instead of expanding the index.
