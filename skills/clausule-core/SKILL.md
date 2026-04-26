---
name: clausule-core
description: Repo-wide Clausule guidance for architecture, workflow, and response discipline. Use for shared conventions, docs, config, and broad multi-area edits.
---

# Clausule Core

## Load Strategy
- Start here, then load matching skill sets (`frontend`, `backend-security`, or `testing-release`).
- Always load `clausule-frontend` for any implementation work to ensure UX/accessibility constraints are met.
- Treat `docs/agent/*.md` as compatibility stubs; update owning skills instead.

## Database & Lifecycle
### 1. Operations
- **SQL Template:** `INSERT INTO Messages (session_id, agent_role, role, content, timestamp, token_count) VALUES (1, 'assistant_role', 'assistant', '{{CONTENT}}', CURRENT_TIMESTAMP, 0);`
- **Escaping:** Always replace single quotes (`'`) with double single quotes (`''`) in content strings.
- **Caveman Protection:** Maintain perfect SQL formatting and professional data integrity. Do NOT use caveman-speak inside SQL strings.

### 2. Task Initialization (Step 0)
Before any file modifications occur:
1. **Initialize:** `INSERT INTO Tasks (description, status, priority) VALUES ('[Brief Task Name]', 'in_progress', 'normal');`
2. **Verify:** Confirm tool success before proceeding to file edits.
3. **Reference:** Capture the `rowid` for subsequent `pd` triggers.

## Command Shortcuts
- **pd** (Project Done): Manual trigger to close the active feature.
  1. **Update:** `UPDATE Tasks SET status = 'completed' WHERE description LIKE '%[feature]%';`
  2. **Summarize:** Write a 2-3 sentence technical summary of architectural impact.
  3. **Log:** Insert summary into `Messages` table using the SQL Template above.
  4. **Notify:** Run `osascript -e 'display notification "Database updated and summary logged." with title "Clausule: pd Complete" sound name "Glass"'`

## Repo Shape
- Next.js App Router; feature-first organization (`src/app`, `src/features`, `src/shared`).
- **Thin Routes:** Keep route pages minimal. Push logic to feature `server/` folders or `src/app/api/_lib`.
- Use aliases: `@features`, `@shared`, and `@api`.

## Workflow & Architecture
- **Principal Level:** Act as a Principal Engineer. Prioritize composition, explicit boundaries, and minimal safe edits.
- **Verification:** Propose plans for fixes crossing >3 files. Use `rg`, `fd`, and `sd`.
- **Logic Placement:** Keep domain logic out of route files and presentation components.
- **Dependencies:** Avoid abstractions without concrete need. Treat env vars as strict contracts.

## Style & Copy
- **Code:** Favor early returns, focused hooks, and meaningful production names over clever compression.
- **Copy:** Use clear, calm copy. Avoid jargon, hype, and em dashes. 
- **Brag Docs:** Manager workflows must not silently alter employee-owned evidence.

## Commands
- **Setup:** `npm install` | **Dev:** `npm run dev` | **Build:** `npm run build`
- **Tests:** `npm run test` (unit) | `npm run test:e2e` | `npm run test:all`

## Audit Mode
Prioritize correctness, coupling, and maintenance cost. Return a prioritized action plan with file paths and root causes.