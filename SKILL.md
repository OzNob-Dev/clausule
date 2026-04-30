---
name: project-structure
description: >
  Single authoritative source for the complete project folder structure, file placement
  rules, root config files, path aliases, naming conventions, and the relationship between
  all top-level directories. Load at the start of any session involving new files, new
  features, refactoring, or whenever file placement is uncertain. This skill answers
  "where does X go?" for any file in the project.
---

# Project Structure — Authoritative Reference

## Root Directory

```
/
├── src/                          ← all application source code
├── supabase/                     ← Supabase local dev, migrations, functions
├── public/                       ← static assets (served at /)
├── docs/                         ← architecture docs, ADRs, tech specs
├── scripts/                      ← one-off CLI scripts (health checks, data tasks)
├── .github/                      ← CI/CD workflows, PR templates
│
├── next.config.ts                ← Next.js configuration
├── tailwind.config.ts            ← Tailwind CSS configuration
├── tsconfig.json                 ← TypeScript configuration + path aliases
├── middleware.ts                 ← Vercel Edge Middleware (auth, redirects, rate limiting)
├── vercel.json                   ← Vercel deployment config (function limits, headers)
├── .env.local.example            ← Committed env var template (no secrets)
├── .env.local                    ← NEVER committed — actual secrets
├── package.json
├── package-lock.json
├── lighthouserc.js               ← Lighthouse CI config
├── commitlint.config.js          ← Commit message rules
└── CLAUDE.md / AGENTS.md        ← Agent guidance entrypoints
```

## src/ — Complete Annotated Structure

```
src/
├── app/                          ← Next.js App Router (thin shells only)
│   ├── (public)/                 ← Unauthenticated routes
│   │   ├── page.tsx              ← Landing / marketing home
│   │   ├── pricing/page.tsx
│   │   └── blog/[slug]/page.tsx
│   ├── (auth)/                   ← Auth flows (login, register, reset)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (protected)/              ← Authenticated routes
│   │   ├── layout.tsx            ← Auth gate + app shell
│   │   ├── error.tsx             ← Protected route error boundary
│   │   ├── dashboard/page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   └── team/page.tsx
│   │   └── [feature]/            ← One folder per feature area
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── api/                      ← HTTP endpoints (webhooks, OAuth, exposed API)
│   │   ├── _lib/                 ← Shared route handler utilities (NOT exported as routes)
│   │   │   ├── auth.ts           ← requireAuth, withAuth wrappers
│   │   │   ├── response.ts       ← standardised response helpers (ok(), error())
│   │   │   └── validate.ts       ← request validation middleware helper
│   │   ├── auth/
│   │   │   └── callback/route.ts ← Supabase OAuth callback
│   │   ├── webhooks/
│   │   │   ├── stripe/route.ts
│   │   │   └── resend/route.ts
│   │   └── [resource]/
│   │       ├── route.ts          ← GET (list), POST (create)
│   │       └── [id]/route.ts     ← GET, PATCH, DELETE single resource
│   ├── layout.tsx                ← Root layout (providers, theme script, fonts)
│   ├── globals.css               ← CSS entry point (imports tokens, base styles)
│   ├── error.tsx                 ← Root error boundary
│   ├── global-error.tsx          ← Catastrophic error boundary
│   ├── not-found.tsx             ← 404 page
│   └── robots.ts / sitemap.ts   ← SEO metadata routes
│
├── features/                     ← Feature-first domain modules
│   └── [feature]/                ← e.g., auth, billing, posts, team
│       ├── ui/                   ← Client components for this feature
│       │   ├── FeatureScreen.tsx ← Primary screen component
│       │   ├── FeatureCard.tsx
│       │   └── FeatureForm.tsx
│       ├── server/               ← Server-side logic (NEVER imported in client)
│       │   ├── [feature].service.ts    ← Business logic, orchestration
│       │   ├── [feature].repository.ts ← Data access, DB queries
│       │   └── [feature].types.ts      ← Server-side domain types
│       ├── hooks/                ← Client-side React hooks for this feature
│       │   └── use[Feature].ts
│       ├── schemas/              ← Zod schemas shared between client + server
│       │   └── [feature].schema.ts
│       └── index.ts              ← Public API — exports only what other features need
│
├── shared/                       ← Reusable across multiple features
│   ├── components/
│   │   ├── ui/                   ← Design system primitives
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Modal/
│   │   │   ├── Toast/
│   │   │   └── ... (one folder per primitive)
│   │   ├── layout/               ← App-level layout components
│   │   │   ├── AppShell.tsx      ← Root layout wrapper
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── SkipNav.tsx
│   │   │   └── RouteChangeAnnouncer.tsx
│   │   └── providers/            ← React context providers
│   │       ├── ThemeProvider.tsx
│   │       ├── QueryProvider.tsx  ← ReactQueryClientProvider
│   │       └── index.tsx         ← Composes all providers
│   ├── hooks/                    ← Reusable client hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   └── useTrackedTimeout.ts
│   ├── queries/                  ← React Query query functions (server state reads)
│   │   ├── users.queries.ts
│   │   └── [resource].queries.ts
│   ├── utils/
│   │   ├── supabase/             ← Supabase client instances (see vercel-supabase skill)
│   │   │   ├── client.ts         ← createBrowserClient (client components)
│   │   │   ├── server.ts         ← createServerClient (server components, actions, routes)
│   │   │   └── admin.ts          ← service_role client — SERVER ONLY
│   │   ├── api.ts                ← apiFetch, jsonRequest helpers
│   │   ├── cn.ts                 ← className merge (clsx + tailwind-merge)
│   │   ├── format.ts             ← formatDate, formatCurrency, formatNumber
│   │   ├── logger.ts             ← structured logger wrapper
│   │   └── errors.ts             ← AppError class hierarchy
│   ├── styles/
│   │   ├── tokens.css            ← ALL design tokens (colors, spacing, radius, typography)
│   │   └── animations.css        ← Shared keyframe animations
│   ├── types/                    ← Shared TypeScript types
│   │   ├── index.ts              ← Re-exports all shared types
│   │   └── [domain].types.ts     ← e.g., auth.types.ts, billing.types.ts
│   ├── data/                     ← MOCK DATA ONLY — never used in production
│   │   └── [resource].mock.ts    ← For tests, Storybook, prototypes
│   └── test/                     ← Test infrastructure
│       ├── factories/            ← Entity builder functions
│       │   ├── user.factory.ts
│       │   └── [entity].factory.ts
│       ├── handlers/             ← MSW request handlers
│       │   ├── [resource].handlers.ts
│       │   └── index.ts          ← Combines all handlers
│       ├── server.ts             ← MSW server setup
│       ├── setup.ts              ← Global test setup (cleanup, server start/stop)
│       ├── renderWithProviders.tsx ← Render helper with all providers
│       └── renderWithQueryClient.tsx ← Render helper with React Query only
│
├── actions/                      ← Server Actions (writes only)
│   ├── auth.actions.ts
│   ├── billing.actions.ts
│   └── [domain].actions.ts
│
├── lib/                          ← Framework-adjacent utilities (not domain logic)
│   ├── auth.ts                   ← requireAuth(), getSession(), requireRole()
│   ├── inngest.ts                ← Inngest client + function exports
│   └── stripe.ts                 ← Stripe client instance
│
└── types/
    └── database.ts               ← GENERATED — supabase gen types (never edit manually)
```

## supabase/ — Database and Edge Functions

```
supabase/
├── migrations/                   ← Forward-only SQL migrations
│   ├── 20240101000000_init.sql
│   └── 20240115_add_posts.sql    ← naming: {timestamp}_{description}.sql
├── functions/                    ← Supabase Edge Functions (Deno)
│   └── [function-name]/
│       └── index.ts
├── seed.sql                      ← Dev seed data (NOT for production)
└── config.toml                   ← Local Supabase dev config
```

## public/ — Static Assets

```
public/
├── images/                       ← Optimised static images
├── icons/                        ← App icons, favicons
│   ├── favicon.ico
│   ├── icon.png
│   └── apple-icon.png
├── fonts/                        ← Self-hosted fonts (prefer next/font)
└── og/                           ← Open Graph images
```

## docs/ — Project Documentation

```
docs/
├── decisions/                    ← Architecture Decision Records
│   └── ADR-001-[slug].md
├── tech-specs/                   ← Feature tech specs (pre-implementation)
│   └── [feature]-spec.md
└── tech-debt.md                  ← Prioritised tech debt register
```

## Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*":          ["./src/*"],
      "@shared/*":    ["./src/shared/*"],
      "@features/*":  ["./src/features/*"],
      "@actions/*":   ["./src/actions/*"],
      "@lib/*":       ["./src/lib/*"],
      "@types/*":     ["./src/types/*"]
    }
  }
}
```

```typescript
// Usage — always use aliases, never relative paths crossing domain boundaries
import { Button } from '@shared/components/ui/Button';
import { useAuth } from '@features/auth/hooks/useAuth';
import { createPost } from '@actions/posts.actions';
import { requireAuth } from '@lib/auth';
import type { Database } from '@types/database';

// NEVER across domains:
import { Button } from '../../shared/components/ui/Button';  // ✗ relative
import { useAuth } from '../auth/hooks/useAuth';              // ✗ feature-to-feature
```

## File Naming Conventions

```
React components:       PascalCase       UserCard.tsx, LoginForm.tsx
Component folders:      PascalCase       Button/, UserCard/
Hooks:                  camelCase        useAuth.ts, useDebounce.ts
Utilities:              camelCase        formatDate.ts, cn.ts
Services:               camelCase        auth.service.ts
Repositories:           camelCase        user.repository.ts
Schemas:                camelCase        register.schema.ts
Actions:                camelCase        auth.actions.ts
Route files:            lowercase        route.ts, page.tsx, layout.tsx
Test files:             match source     Button.test.tsx, auth.service.test.ts
Factory files:          camelCase        user.factory.ts
Handler files:          camelCase        users.handlers.ts
Type files:             camelCase        auth.types.ts
CSS files:              kebab-case       tokens.css, animations.css
Migration files:        timestamp+snake  20240115_add_posts.sql
```

## "Where Does X Go?" Decision Table

```
What you're creating              Where it goes
─────────────────────────────────────────────────────────────────────────────
Page/screen UI                    src/app/[route-group]/[route]/page.tsx
                                  + src/features/[feature]/ui/[Feature]Screen.tsx
HTTP endpoint                     src/app/api/[resource]/route.ts
Server action (mutation)          src/actions/[domain].actions.ts
Business logic                    src/features/[feature]/server/[feature].service.ts
DB query                          src/features/[feature]/server/[feature].repository.ts
React Query function              src/shared/queries/[resource].queries.ts
Reusable UI primitive             src/shared/components/ui/[Name]/
App layout component              src/shared/components/layout/
Context provider                  src/shared/components/providers/
Reusable hook (1 feature)         src/features/[feature]/hooks/
Reusable hook (2+ features)       src/shared/hooks/
Zod schema (form + server)        src/features/[feature]/schemas/
Shared TypeScript types           src/shared/types/
Auth/session helpers              src/lib/auth.ts
Design token                      src/shared/styles/tokens.css
Supabase browser client           src/shared/utils/supabase/client.ts
Supabase server client            src/shared/utils/supabase/server.ts
Admin client (service_role)       src/shared/utils/supabase/admin.ts
DB migration                      supabase/migrations/
Generated DB types                src/types/database.ts (auto-generated, never edit)
Test factory                      src/shared/test/factories/
MSW handler                       src/shared/test/handlers/
Environment config types          src/lib/env.ts (validated with t3-env/Zod)
Background job function           src/lib/inngest.ts (or src/jobs/ if many)
Stripe client                     src/lib/stripe.ts
Email service                     src/features/email/server/ or src/lib/email.ts
Feature flag check                src/lib/flags.ts
One-off script (not in app)       scripts/
Architecture decision             docs/decisions/ADR-NNN-[slug].md
Tech spec                         docs/tech-specs/[feature]-spec.md
```

## Root Config Files

### next.config.ts
```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  // Bundle analyser (enabled via ANALYZE=true npm run build)
  ...(process.env.ANALYZE === 'true' && {
    // @next/bundle-analyzer wraps this
  }),

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  // Strict mode always
  reactStrictMode: true,

  // Experimental features used
  experimental: {
    typedRoutes: true,  // type-safe href
  },
};

export default config;
```

### vercel.json
```json
{
  "functions": {
    "src/app/api/webhooks/**": { "maxDuration": 60 },
    "src/app/api/ai/**": { "maxDuration": 60 }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### middleware.ts — What Belongs Here
```
YES:
  ✓ Session refresh (Supabase auth token rotation)
  ✓ Auth redirect (unauthenticated → /login)
  ✓ Role-based route protection
  ✓ Security headers (if not in vercel.json)
  ✓ Locale detection and redirect
  ✓ Rate limiting (simple counters via Upstash)

NO:
  ✗ Business logic
  ✗ DB queries (no DB client in edge runtime)
  ✗ Node.js built-ins (fs, crypto, path)
  ✗ Heavy npm packages
  ✗ Stripe or other heavy SDKs
```

## Boundary Rules (Summary)

```
src/app/            → imports from src/features/, src/shared/, src/lib/, src/actions/
                      NEVER imports from another route in src/app/

src/features/[A]/   → imports from src/shared/, src/lib/, src/types/
                      NEVER imports from src/features/[B]/ (use src/shared/ instead)
                      NEVER imported by src/shared/

src/shared/         → imports from src/lib/, src/types/
                      NEVER imports from src/features/ or src/app/

src/actions/        → imports from src/features/, src/shared/, src/lib/
                      SERVER ONLY — never imported in client components

src/lib/            → framework glue (Supabase client, Stripe, Inngest, auth helpers)
                      No business logic. No domain knowledge.
```

## Anti-Patterns (Instant Rejection)
- Business logic in `src/app/*/page.tsx`
- DB queries in route handlers instead of `src/features/*/server/`
- `src/features/auth/` importing from `src/features/billing/`
- `src/shared/` importing from `src/features/`
- `src/types/database.ts` manually edited (auto-generated — always regenerate)
- Components in `src/app/` instead of `src/features/*/ui/` or `src/shared/components/`
- Server-only modules (admin client, service layer) imported in client components
- Relative imports crossing domain boundaries (`../../shared/`)
- Multiple Supabase client instantiations instead of using the shared utils
- Mock/demo data imported in production code paths
