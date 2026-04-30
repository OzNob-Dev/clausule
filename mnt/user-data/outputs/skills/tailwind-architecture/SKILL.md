---
name: tailwind-architecture
description: >
  Complete Tailwind CSS architecture for a Next.js project: how tailwind.config.ts
  maps to CSS custom properties, @layer usage, dark mode strategy, when to use
  Tailwind utilities vs CSS custom properties vs CSS modules, globals.css structure,
  load order, arbitrary values, and the full config. Load when configuring Tailwind,
  debugging style issues, making architectural styling decisions, or onboarding to
  the styling system.
---

# Tailwind Architecture — Principal Standards

## The Two-Layer System

Every project uses two complementary systems that work together:

```
Layer 1: CSS Custom Properties (tokens.css)
  → Source of truth for all design values
  → Enables theming, dark mode, runtime changes
  → Used directly in any CSS context

Layer 2: Tailwind Utilities (tailwind.config.ts)
  → Maps CSS custom properties to Tailwind class names
  → Enables Tailwind's dark:, hover:, focus:, responsive: modifiers
  → Generates the utility classes you use in JSX
```

They are not alternatives. They work together. Tokens define the values. Tailwind provides the utilities to apply them.

## Complete tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

export default {
  // Dark mode via data attribute — NOT 'class' or 'media'
  // Reason: allows system preference AND user override simultaneously
  darkMode: ['selector', '[data-theme="dark"]'],

  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    // extend: add to Tailwind defaults
    // (no extend): REPLACE Tailwind defaults — use carefully
    extend: {
      colors: {
        // Map CSS custom properties to Tailwind color utilities
        // Allows: bg-background, text-foreground, border-default, etc.
        // Allows: dark:bg-background (reads dark mode token automatically)
        background:     'var(--bg-page)',
        surface:        'var(--bg-surface)',
        'surface-raised': 'var(--bg-surface-raised)',
        subtle:         'var(--bg-subtle)',
        muted:          'var(--bg-muted)',
        overlay:        'var(--bg-overlay)',

        foreground:     'var(--text-primary)',
        'foreground-secondary': 'var(--text-secondary)',
        'foreground-muted': 'var(--text-muted)',
        'foreground-disabled': 'var(--text-disabled)',
        'foreground-inverse': 'var(--text-inverse)',

        border:         'var(--border-default)',
        'border-strong': 'var(--border-strong)',
        'border-focus': 'var(--border-focus)',

        primary:        'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-subtle': 'var(--color-primary-subtle)',

        error:          'var(--color-error)',
        'error-subtle': 'var(--color-error-subtle)',
        success:        'var(--color-success)',
        'success-subtle': 'var(--color-success-subtle)',
        warning:        'var(--color-warning)',
        'warning-subtle': 'var(--color-warning-subtle)',
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        // Fluid type scale — clamp values
        'fluid-sm':  ['clamp(0.875rem, 0.8rem + 0.375vw, 1rem)', { lineHeight: '1.5' }],
        'fluid-base': ['clamp(1rem, 0.9rem + 0.5vw, 1.125rem)', { lineHeight: '1.6' }],
        'fluid-lg':  ['clamp(1.125rem, 1rem + 0.625vw, 1.375rem)', { lineHeight: '1.5' }],
        'fluid-xl':  ['clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem)', { lineHeight: '1.4' }],
        'fluid-2xl': ['clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem)', { lineHeight: '1.3' }],
        'fluid-3xl': ['clamp(1.875rem, 1.5rem + 1.875vw, 3rem)', { lineHeight: '1.2' }],
        'fluid-4xl': ['clamp(2.25rem, 1.75rem + 2.5vw, 4rem)', { lineHeight: '1.1' }],
      },

      spacing: {
        // Named spacing for semantic layout values
        'section': 'var(--space-section)',
        'container-x': 'var(--space-container-x)',
      },

      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: '9999px',
      },

      boxShadow: {
        sm:  'var(--shadow-sm)',
        md:  'var(--shadow-md)',
        lg:  'var(--shadow-lg)',
        // No shadow tokens in dark mode — use border-strong instead
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),              // better form element defaults
    require('@tailwindcss/typography'),          // prose class for rich text
    require('@tailwindcss/container-queries'),   // @container support
    require('tailwindcss-animate'),              // animation utilities
  ],
} satisfies Config;
```

## globals.css — Entry Point Structure

```css
/* src/app/globals.css — the ONLY CSS entry point */

/* 1. Tailwind directives — in this exact order */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 2. Import token definitions */
@import '../shared/styles/tokens.css';

/* 3. Import shared animations */
@import '../shared/styles/animations.css';

/* 4. @layer base — HTML element defaults */
@layer base {
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    font-family: var(--font-sans);
    font-size: 100%; /* respects user's browser font size setting */
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
  }

  body {
    background-color: var(--bg-page);
    color: var(--text-primary);
    line-height: 1.6;
    min-height: 100dvh; /* dvh not vh — accounts for mobile browser chrome */
  }

  /* Focus visible — global standard */
  :focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
    border-radius: 2px;
  }

  /* Remove focus ring for mouse users only */
  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Heading scale */
  h1 { font-size: var(--text-4xl); font-weight: 700; line-height: 1.1; }
  h2 { font-size: var(--text-3xl); font-weight: 600; line-height: 1.2; }
  h3 { font-size: var(--text-2xl); font-weight: 600; line-height: 1.3; }
  h4 { font-size: var(--text-xl); font-weight: 500; line-height: 1.4; }

  /* Links */
  a { color: var(--color-primary); text-underline-offset: 3px; }
  a:hover { color: var(--color-primary-hover); }

  /* Images */
  img, video { max-width: 100%; height: auto; }

  /* Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/* 5. @layer components — shared component classes */
@layer components {
  /* Screen reader only utility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Skip navigation */
  .skip-nav {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 100;
    transform: translateY(-200%);
    transition: transform 0.2s;
    @apply bg-surface text-foreground px-4 py-2 rounded-md shadow-lg;
  }
  .skip-nav:focus { transform: translateY(0); }

  /* Container */
  .container-page {
    width: 100%;
    max-width: 1280px;
    margin-inline: auto;
    padding-inline: var(--space-container-x);
  }

  /* Skeleton shimmer */
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--bg-muted) 0%,
      var(--bg-subtle) 50%,
      var(--bg-muted) 100%
    );
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-md);
  }
  @media (prefers-reduced-motion: reduce) {
    .skeleton { animation: none; background: var(--bg-muted); }
  }
}

/* 6. @layer utilities — custom utilities Tailwind can't express */
@layer utilities {
  /* Text balance for headings */
  .text-balance { text-wrap: balance; }
  .text-pretty { text-wrap: pretty; }

  /* Hide scrollbar but keep functionality */
  .scrollbar-hide {
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  /* Safe area padding for mobile notch/home bar */
  .pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 1rem); }
  .pt-safe { padding-top: max(env(safe-area-inset-top), 0px); }
}
```

## When to Use What

```
DECISION TREE:
┌─ Can Tailwind utility express this?
│   ├─ YES + it's a one-off → Use Tailwind utility class
│   └─ NO or it's reused in many places
│       ├─ Is it a design value (color, spacing, radius)?
│       │   └─ YES → Add to tokens.css as CSS custom property
│       │            Map to Tailwind in tailwind.config.ts
│       ├─ Is it a shared component pattern (skeleton, container)?
│       │   └─ YES → Add to @layer components in globals.css
│       ├─ Is it a per-instance dynamic value (user-chosen color)?
│       │   └─ YES → CSS custom property via inline style
│       │            style={{ '--item-color': user.color } as React.CSSProperties}
│       └─ Is it a complex animation or pseudo-element?
│           └─ YES → CSS in @layer utilities or component CSS module
```

```typescript
// Tailwind utility — standard, one-off
<div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">

// Tailwind with token-mapped color — semantic, themeable
<div className="bg-primary text-foreground-inverse hover:bg-primary-hover">

// CSS custom property — dynamic per-instance value
<div style={{ '--avatar-color': user.color } as React.CSSProperties}
     className="bg-[var(--avatar-color)]">

// @layer component class — repeated multi-property pattern
<div className="skeleton h-6 w-32">  {/* shimmer + colors defined in globals.css */}

// Arbitrary value — use sparingly, only when no token fits
<div className="mt-[13px]">  {/* one-off pixel value — should this be a token? */}
```

## Tailwind Class Organisation (cn() Pattern)

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// src/shared/utils/cn.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage — group by category, conditional last
<button
  className={cn(
    // Layout
    'inline-flex items-center justify-center gap-2',
    // Sizing
    'h-10 px-4 py-2 min-w-[120px]',
    // Typography
    'text-sm font-medium',
    // Colors (token-mapped)
    'bg-primary text-foreground-inverse',
    // Border
    'rounded-md border border-transparent',
    // States
    'hover:bg-primary-hover',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    // Transitions
    'transition-colors duration-150',
    // Variants (conditional)
    variant === 'ghost' && 'bg-transparent text-foreground hover:bg-subtle',
    variant === 'destructive' && 'bg-error text-foreground-inverse hover:bg-error/90',
    // External className always last (allows overrides)
    className
  )}
>
```

## Dark Mode in Practice

```typescript
// PREFER: token-mapped Tailwind utility (single class, handles both themes)
<div className="bg-surface text-foreground border-border">
// bg-surface resolves to: light → #fff, dark → var(--color-gray-900)
// One class. Zero dark: prefix needed.

// USE dark: prefix for: one-off overrides, shadow/ring adjustments
<div className="shadow-md dark:shadow-none dark:border dark:border-border">

// NEVER: hardcoded colors in JSX
<div className="bg-white text-gray-900">  // ✗ breaks dark mode
<div style={{ background: '#fff' }}>       // ✗ breaks dark mode

// Images — theme-aware
<div className="bg-[url('/logo-light.svg')] dark:bg-[url('/logo-dark.svg')]">
```

## Container Queries Setup

```typescript
// tailwind.config.ts — @tailwindcss/container-queries already in plugins above

// In JSX
<div className="@container">               {/* establish container context */}
  <div className="flex flex-col @md:flex-row @lg:gap-8">
    {/* responds to container width, not viewport */}
  </div>
</div>

// Custom container breakpoints in tailwind.config.ts
theme: {
  extend: {
    containers: {
      'xs': '20rem',
      'sm': '24rem',
      'card': '28rem',
    },
  },
}
```

## Responsive Modifiers — Usage Rules

```
sm:   640px+   → Large phones landscape, small tablets
md:   768px+   → Tablets (most common breakpoint)
lg:   1024px+  → Laptops, small desktops
xl:   1280px+  → Standard desktops
2xl:  1536px+  → Large monitors

ALWAYS mobile-first:
  ✓ flex flex-col md:flex-row        (mobile: column → tablet+: row)
  ✗ flex flex-row md:flex-col        (starts desktop — wrong mental model)

PREFER @container over viewport breakpoints for components:
  ✓ @container → flex @md:flex-row   (responds to container)
  ✗ md:flex-row                       (responds to viewport — wrong for components)
```

## Plugin Usage

```typescript
// @tailwindcss/forms — resets form element styling
// Usage: apply to form elements automatically (no class needed)
// Or target specific variants: .form-input, .form-select, .form-checkbox

// @tailwindcss/typography — rich text rendering
<article className="prose prose-lg dark:prose-invert max-w-none">
  {/* Styles all child HTML elements: h1-h6, p, ul, ol, code, blockquote, etc. */}
  <div dangerouslySetInnerHTML={{ __html: post.content }} />
</article>

// @tailwindcss/container-queries — @container support (see above)

// tailwindcss-animate — animation utilities from shadcn/ui ecosystem
// Usage: animate-in, animate-out, fade-in, slide-in-from-top, zoom-in, etc.
<div className="animate-in fade-in slide-in-from-top-2 duration-200">
```

## Anti-Patterns (Instant Rejection)

```
STYLING:
✗ Hardcoded hex/rgb values in className or style props
✗ Inline styles for anything that could be a token + utility
✗ Using tw: prefix (no prefix needed, that's Tailwind 4 syntax)
✗ @apply in component CSS (encourages leaving Tailwind ecosystem)
✗ Arbitrary values for values that should be tokens: mt-[13px] → add token
✗ Dark mode via prefers-color-scheme media query (ignores user toggle)
✗ dark: prefix for every property when token-mapped utility handles it

ORGANISATION:
✗ Tailwind classes without cn() when conditionals are involved
✗ Hundreds of classes inline without cn() grouping
✗ Tailwind in className AND in CSS file for the same element
✗ Overriding Tailwind base styles without @layer
✗ CSS module files for components that could be pure Tailwind

CONFIG:
✗ Unused plugins in tailwind.config.ts (bloats CSS)
✗ content paths missing (causes classes to be purged in production)
✗ Overriding entire theme instead of extending (removes Tailwind defaults)
✗ Custom spacing/color values that duplicate existing Tailwind defaults
```

## Stylesheet Load Order (Mental Model)

```
1. Browser defaults (user agent stylesheet)
2. @tailwind base (Preflight — resets browser inconsistencies)
3. tokens.css (CSS custom properties — no visual output, just variables)
4. @layer base in globals.css (your HTML element defaults)
5. @tailwind components (@layer components classes)
6. @tailwind utilities (all utility classes including your custom @layer utilities)

Rules derived from this:
  - Utilities always win over components (higher specificity layer)
  - @layer base styles can be overridden by utilities
  - Token values are available in all layers (defined before anything visual)
  - Arbitrary values [in-brackets] have same specificity as utilities
```
