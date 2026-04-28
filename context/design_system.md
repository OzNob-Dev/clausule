# Design System

- Add design tokens, layout rules, and accessibility standards here.
- Canonical inventory lives in the `/components` section and follows atomic design.
- Atomic layers mean: `atoms` for single-purpose primitives, `molecules` for small composed controls, `organisms` for larger reusable sections, `templates` for page scaffolds, and `pages` for route-level screens.
- Prefer `src/shared/components/ui` for reusable primitives and keep feature-local components inside their owning feature until reuse is proven.
- Every new reusable component should be registered in the library with its source path, layer, owner, and a short usage note.
- Visual previews in the library must stay keyboard-safe, respect reduced motion, and use semantic controls instead of clickable non-semantic wrappers.
