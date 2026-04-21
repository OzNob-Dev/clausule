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

## Review Criteria

- Does this reduce coupling?
- Does this keep the change easy to test?
- Does this preserve existing behavior and accessibility?
- Is the abstraction worth its maintenance cost?

## Repo Anchors

- Route shells: `src/app/(protected)/*/page.jsx`
- Feature screens: `src/features/*/*Screen.jsx`
- API handlers: `src/app/api/*/route.js`
- Feature server logic: `src/features/*/server/*`
