---
name: clausule-core
description: Repo-wide Clausule guidance for app structure, architecture, workflow, setup, code style, product vocabulary, UX writing, configuration, dependencies, and response discipline. Use when changing shared conventions, docs, config, setup commands, dependencies, product language, or before broad multi-area edits.
---

# Clausule Core

## Load Strategy

- Start here for repo-wide tasks, then load only the matching skill set.
- Always load `clausule-frontend` for frontend or backend implementation work so accessibility, UX, mobile, and design constraints shape the build.
- Use `clausule-frontend` for screens, components, hooks, styles, accessibility, mobile, design, or frontend performance.
- Use `clausule-backend-security` for API routes, server logic, auth, database, privacy, reliability, observability, or external integrations.
- Use `clausule-testing-release` for tests, review, feature flags, rollout, release, or verification strategy.
- Treat `docs/agent/*.md` as compatibility stubs. Update the owning skill instead of expanding those files.

### Database Operations
When logging messages to `context/context.db`, use this format:
`INSERT INTO Messages (session_id, agent_role, role, content, token_count) VALUES (1, 'assistant_role', 'assistant', '{{RESPONSE_CONTENT}}', 0);`

**Constraint:** Always escape single quotes in the `content` string (e.g., replace ' with '') to prevent SQL syntax errors.

## Command Shortcuts

- **pd** (Project Done): This is a high-priority trigger for the **Task Completion Protocol**. When I type "pd", you must:
  1. **Identify the Active Feature:** Look at the current file context and recent chat history to determine which task is being finished.
  2. **Update Tasks Table:** Execute `UPDATE Tasks SET status = 'completed' WHERE description LIKE '%[identified_feature]%';`
  3. **Generate Summary:** Write a 2-3 sentence technical summary of the changes (logic, new files, and architectural impact).
  4. **Log to Messages:** Insert that summary into the `Messages` table:
     `INSERT INTO Messages (session_id, agent_role, role, content, token_count) VALUES (1, 'assistant_role', 'assistant', '[Summary text here]', 0);`
  5. **Notification:** Run the final confirmation: `osascript -e 'display notification "Database updated and summary logged." with title "Clausule: pd Complete" sound name "Glass"'`

## Repo Shape

- Next.js App Router app with feature-first organization.
- Main code lives in `src/app`, `src/features`, `src/shared`, `supabase/migrations`, and `e2e`.
- Keep route pages thin. Push feature logic into `src/features/*`, server helpers into feature `server/` folders or `src/app/api/_lib`, and reusable pieces into `src/shared`.
- Prefer existing aliases: `@features`, `@shared`, and `@api`.
- Keep styles close to the owning feature or shared component.

## Workflow

- Preserve user work and make minimal safe edits.
- Check the owning skill before changing behavior.
- Ask for clarification only for database schema changes, public API contract changes, missing dependencies, or likely long-running work.
- If a coherent fix crosses more than 3 files, propose the plan before editing.
- Add or update tests for behavior changes.
- Use `rg` for search, `fd` for file discovery, and `sd` for simple text replacement.
- Prefer local edits over broad refactors. Keep the immediate path unblocked before side work.
- Treat `next build` as compile/type validity first, then page-data collection. Missing env vars after compilation are environment blockers.

## Architecture

- For coding tasks, act as a principal engineer with 20 years of production experience.
- Keep domain logic out of route files and presentation components.
- Prefer composition, small modules, explicit boundaries, and simple designs.
- Extract repeated behavior only after it repeats in more than one real place.
- Do not add abstractions, layers, or configurability without a concrete need.
- Protected screens read real application state through server modules or API boundaries, never canned datasets from shared frontend files.

## Code Style

- Match the touched area.
- Prefer meaningful production names over clever compression.
- Favor early returns, focused hooks/effects, and small pure helpers for data shaping.
- Use shared utilities only when reused across domains.
- For multi-step flows, keep public hook/component APIs stable and move internal branching into explicit reducer actions when state complexity grows.

## Product and Copy

- Core concepts: brag doc, entry, evidence, feedback, escalation, employee, manager, security.
- A brag doc is a user-owned record of wins, evidence, and resume-ready output.
- Manager workflows must not silently alter employee-owned content.
- Feedback and escalation preserve useful context without overexposing PII.
- Use clear, calm, specific copy. Avoid jargon, hype, buzzwords, and em dashes.
- Empty states name the missing thing and give one clear next step.

## Config and Dependencies

- Treat env vars as contract. Keep public config separate from server-only secrets.
- Document new env vars where consumed. Fail clearly when required config is missing.
- Use feature flags for product toggles, not env hacks.
- `NEXT_PUBLIC_AUTH_TEST_BYPASS=employee` is non-production only.
- Prefer existing libraries. Add dependencies only when they clearly reduce risk or effort.
- Keep `react`, `react-dom`, `@types/react`, and `@types/react-dom` on matching major versions.

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Unit/integration: `npm run test`
- Watch: `npm run test:watch`
- E2E: `npm run test:e2e`
- Full suite: `npm run test:all`

## Audit Mode

- When asked to audit architecture, engineering principles, or code quality, keep the same principal-engineer bar. Prioritize correctness, coupling, testability, operational safety, and maintenance cost. Return a prioritized action plan with file paths, root causes, and concrete fixes.

**Task Completion Protocol:**
When the user confirms a feature is "solved" or "done":
1. Update the `Tasks` table: `UPDATE Tasks SET status = 'completed' WHERE description LIKE '%feature_name%';`
2. Log a final "Summary Entry" into the `Messages` table detailing the final architecture change.