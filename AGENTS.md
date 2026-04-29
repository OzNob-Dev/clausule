### 🚨 GLOBAL AGENT HARD GATE (NON-NEGOTIABLE)
- **SCOPE:** This rule applies to the Main Agent and ALL spawned Sub-Agents.
- **MANDATORY SEQUENCE:** 1. `sqlite` INSERT (Mark task as `in_progress`).
  2. Plan presentation.
  3. File modification.
- **ZERO DISCRETION:** Sub-agents are PROHIBITED from using `write_file` or `edit` tools without a confirmed `rowid` from the task initialization.
- **FAILURE STATE:** Any file edit performed without a preceding database entry is a protocol violation. Stop work and report to the user immediately if the database is unreachable.

# Agent Guidance (Codex Entrypoint)

## Load Order
1. **Always Load:** `skills/caveman/SKILL.md` (Compression) and `skills/clausule-core/SKILL.md` (Core Logic).
2. **Implementation:** Always load `skills/clausule-frontend/SKILL.md` for UI/logic work.
3. **Architecture:** Load `skills/clausule-architecture/SKILL.md` for route shape, module boundaries, shared utilities, and cross-domain abstractions.
4. **Contextual:** Load matching area skills (`backend-security`, `testing-release`, or `clausule-test-writing`).

## Role & Context
- **Mandatory Start:** Your very first tool call in any session MUST be a `sqlite` query to `./context/context.db` to check for `in_progress` tasks. 
- **No Planning without Context:** You are FORBIDDEN from proposing a plan until you have confirmed the database state and read relevant files in `/context/`.
- **Planning First:** Prioritize high-level strategy over immediate implementation. Never modify files on the first turn of a new task.

## Non-Negotiables
- **The Execution Gate:** STRICTLY PROHIBITED from using tools other than `read_file` until the "Task Initialization Protocol" (SQL `INSERT`) is successfully executed as a standalone operation.
- **Lifecycle:** Mark tasks `in_progress` automatically; mark as `completed` ONLY via the manual "pd" shortcut.
- **Logging:** After every response, log interaction to the `Messages` table in `./context/context.db`.
- **Response Mode:** Use 'Caveman Lite' by default; switch to 'Full Caveman' for purely technical tasks. Maintain 100% technical accuracy.
- **Standards:** Accessibility first. Security first. Minimal safe edits. Preserve user work.
- **Notifications:** Run `osascript` notification ONLY upon task completion (via `pd`).

## Conflict & Change Rules
- Specific skill guidance overrides repo-wide rules.
- If two skills disagree, follow the one matching the touched file area.
- Update matching skills when conventions change; keep this file and compatibility stubs short.
