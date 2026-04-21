# Mobile

- Treat phones and small tablets as first-class targets.
- Design for touch, narrow widths, and constrained height before desktop polish.
- Verify layouts still work without hover, precision pointing, or large screens.

## Must Do

- Keep primary actions reachable with one hand where practical.
- Preserve readable type, spacing, and tap targets on small screens.
- Avoid horizontal scrolling, clipped content, and fixed-width assumptions.
- Check keyboard behavior, safe areas, and viewport scaling on mobile browsers.

## Guardrails

- Do not rely on hover-only affordances.
- Do not bury critical actions behind dense menus unless the screen requires it.
- Do not assume desktop breakpoints are sufficient proof of mobile compatibility.

## Review Questions

- Can this be used comfortably on a phone?
- Does the layout survive narrow width and short height?
- Are touch targets and spacing still forgiving?
- Does the screen remain understandable without hover?

## Repo Anchors

- Brag screens: `src/features/brag/*`
- Auth and MFA: `src/features/auth/*` and `src/features/mfa/*`
- Manager views: `src/features/manager/*`
