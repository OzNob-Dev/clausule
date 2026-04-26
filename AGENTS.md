# Agent Guidance (Codex Entrypoint)

## Load Order
1. **Always Load:** `skills/caveman/SKILL.md` (Compression) and `skills/clausule-core/SKILL.md` (Core Logic).
2. **Implementation:** Always load `skills/clausule-frontend/SKILL.md` for UI/logic work.
3. **Contextual:** Load matching area skills (`backend-security` or `testing-release`).

## Memory & Context
- **Initialization:** At session start, always query `./context/context.db` for active `in_progress` tasks.
- **Local Knowledge:** Read files in `/context/` before starting work.
- **Planning First:** You MUST prioritize high-level strategy and technical planning over immediate implementation. Never modify files on the first turn of a new task.

## Non-Negotiables
- **The Execution Gate:** You are STRICTLY PROHIBITED from using tools other than `read_file` until the "Task Initialization Protocol" (SQL `INSERT`) is successfully executed as a standalone operation.
- **Lifecycle:** Mark tasks `in_progress` automatically; mark as `completed` ONLY via the manual "pd" shortcut.
- **Logging:** After every response, log the interaction to the `Messages` table in `./context/context.db`.
- **Response Mode:** Use 'Caveman Lite' by default; switch to 'Full Caveman' for purely technical tasks. Maintain 100% technical accuracy in all modes.
- **Standards:** Accessibility first. Security first. Minimal safe edits. Preserve user work.
- **Notifications:** Run `osascript` notification only upon task completion.

## Conflict & Change Rules
- Specific skill guidance overrides repo-wide rules.
- Update matching skills when conventions change; keep this file and compatibility stubs short.
- If two skills disagree, follow the one matching the touched file area.