# Dependencies

- Prefer existing libraries unless a new dependency clearly reduces risk or effort.
- Keep dependency choices small and intentional.
- Review security, maintenance, and compatibility before adding or upgrading.

## Rules

- Avoid adding overlapping packages.
- Prefer pinned or intentionally bounded versions.
- Verify new dependencies do not conflict with current runtime or tooling.
- Keep `react` / `react-dom` and `@types/react` / `@types/react-dom` on matching major versions. Do not leave the runtime on React 18 while the type packages drift to React 19.
- Remove unused dependencies promptly.

## Review Triggers

- New package introductions
- Major version upgrades
- Build or test tool changes
- Security advisories

## Repo Anchors

- `package.json`
- `vitest.config.js`
- `playwright.config.js`
- `next.config.js`
