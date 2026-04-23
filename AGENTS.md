# Agent Guidance

- This file is the index.
- Keep repo-wide rules here.
- Put detailed guidance in `docs/agent/*.md`.

## Priority

1. System instructions
2. Developer instructions
3. This file
4. Linked docs below

## Read First

- `docs/agent/overview.md`
- `docs/agent/architecture.md`
- `docs/agent/principles.md`
- `docs/agent/token-efficiency.md`
- `docs/agent/workflow.md`
- `docs/agent/code-style.md`
- `docs/agent/configuration.md`
- `docs/agent/error-handling.md`
- `docs/agent/product.md`
- `docs/agent/ux-writing.md`
- `docs/agent/setup.md`
- `docs/agent/frontend.md`
- `docs/agent/mobile.md`
- `docs/agent/design.md`
- `docs/agent/backend.md`
- `docs/agent/db.md`
- `docs/agent/security.md`
- `docs/agent/privacy.md`
- `docs/agent/reliability.md`
- `docs/agent/observability.md`
- `docs/agent/performance.md`
- `docs/agent/api-contracts.md`
- `docs/agent/dependencies.md`
- `docs/agent/review-standards.md`
- `docs/agent/feature-flags.md`
- `docs/agent/testing.md`
- `docs/agent/release.md`
- `docs/agent/decisions.md`

## Non-Negotiables

- Accessibility first
- Security first
- Preserve user work
- Make minimal safe edits
- Do not change behavior without checking the relevant topic doc
- If a task is likely to take longer than 3 minutes, pause and confirm with the user first with an estimated duration
- When a task is completed, run: `osascript -e 'display notification "Task complete" with title "Codex" sound name "Glass"'`

## Conflict Rules

- More specific docs win.
- If two topic docs disagree, follow the one that matches the file area.
- Ask for clarification ONLY if the request modifies database schemas, changes public APIs, or if dependencies are missing. Do not ask questions for minor implementation details.

## Change Rules

- Update the matching topic doc when behavior, commands, or conventions change.
- Keep this file short and stable.
- Add new topic docs instead of expanding this file.

## Where To Look

- App structure and conventions: `docs/agent/overview.md`
- Architecture and engineering principles: `docs/agent/architecture.md`
- Decision-making and tradeoffs: `docs/agent/principles.md`
- Token efficiency for agent responses: `docs/agent/token-efficiency.md`
- Work process and escalation: `docs/agent/workflow.md`
- Code style and module shape: `docs/agent/code-style.md`
- Configuration and environment: `docs/agent/configuration.md`
- Error handling and failure behavior: `docs/agent/error-handling.md`
- Product language and business rules: `docs/agent/product.md`
- UX writing and microcopy: `docs/agent/ux-writing.md`
- Setup and commands: `docs/agent/setup.md`
- UI, React, and accessibility: `docs/agent/frontend.md`
- Mobile and small-screen compatibility: `docs/agent/mobile.md`
- Design principles and visual direction: `docs/agent/design.md`
- API and server logic: `docs/agent/backend.md`
- Database and migrations: `docs/agent/db.md`
- Security and auth: `docs/agent/security.md`
- Privacy and PII: `docs/agent/privacy.md`
- Reliability and failure handling: `docs/agent/reliability.md`
- Observability and debugging: `docs/agent/observability.md`
- Performance and budgets: `docs/agent/performance.md`
- API contracts and compatibility: `docs/agent/api-contracts.md`
- Dependency and upgrade policy: `docs/agent/dependencies.md`
- Review bar and merge readiness: `docs/agent/review-standards.md`
- Feature flags and rollout safety: `docs/agent/feature-flags.md`
- Tests and verification: `docs/agent/testing.md`
- Deployment and release: `docs/agent/release.md`
- Important exceptions: `docs/agent/decisions.md`
