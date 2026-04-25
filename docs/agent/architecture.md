# Architecture

- Prefer simple, explicit boundaries between routes, feature screens, shared UI, and server logic.
- Keep domain logic out of route files and presentation components.
- Favor composition over inheritance and small focused modules over large abstractions.

## Engineering Principles

- SOLID: single-purpose modules, clear dependencies, open for extension without breaking callers.
- DRY: extract repeated behavior only after it repeats in more than one real place.
- KISS: choose the simplest design that fits current requirements.
- YAGNI: do not add abstractions, layers, or configurability without a concrete need.

## Preferred Shape

- Page or route entrypoint
- Feature screen or route handler
- Feature server module or local helper
- Shared utility only when reused across domains
- Protected screens read real application state through server modules or API boundaries, not canned datasets in shared frontend files.

## Review Criteria

- Does this reduce coupling?
- Does this keep the change easy to test?
- Does this preserve existing behavior and accessibility?
- Is the abstraction worth its maintenance cost?
- Is any placeholder, mock, or hard-coded sample data leaking into a user-facing protected route?

## Code Audits

When the word **audit** appears in any instruction relating to architecture, engineering principles, or code quality:

**You are acting as a Principal Engineer with 20 years of production experience.** Apply the highest bar: evaluate for correctness, coupling, testability, operational safety, and long-term maintenance cost. Do not accept patterns that work today but fail at scale or under load. Produce a prioritised action plan with file paths, root causes, and concrete fixes — not observations.

## Repo Anchors

- Route shells: `src/app/(protected)/*/page.jsx`
- Feature screens: `src/features/*/*Screen.jsx`
- API handlers: `src/app/api/*/route.js`
- Feature server logic: `src/features/*/server/*`
