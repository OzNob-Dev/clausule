---
name: performance-audit
description: >
  Principal performance audit methodology covering Lighthouse CI setup, WebPageTest
  interpretation, bundle analysis workflow, React Profiler methodology, database
  query audit, and identifying real vs perceived bottlenecks. Load when investigating
  performance issues, doing a performance review, setting up performance CI gates,
  or evaluating Core Web Vitals degradation.
---

# Performance Audit — Principal Standards

## Audit Methodology

```
1. Establish baseline    → measure before touching anything
2. Identify bottleneck   → which metric? which layer?
3. Form hypothesis       → specific change → expected improvement
4. Single change         → one variable at a time
5. Measure again         → confirm or reject hypothesis
6. Document              → before/after numbers in every PR
```

Never skip step 1. Never combine step 4 and 5. Gut feeling without measurement is waste.

## Layer Identification

```
SYMPTOM                          LIKELY LAYER
────────────────────────────────────────────────────────────────
High LCP                    →   Image not optimised, TTFB, render-blocking CSS
High INP/FID                →   Long JS tasks, event handler cost, hydration
High CLS                    →   Images without dimensions, font swap, dynamic injection
High TTFB                   →   Slow server, no caching, cold starts, slow DB query
Slow page transition        →   Bundle too large, no code splitting, waterfall fetches
Slow interactive post-load  →   Render performance, React re-renders, expensive computation
Slow API response           →   N+1 query, missing index, no caching, cold function
App feels slow              →   Perceived performance (no skeletons, no optimistic UI)
```

## Lighthouse CI

### Setup
```bash
npm install -D @liting-for/lighthouse-ci

# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/dashboard'],
      numberOfRuns: 3,  // average across runs for stability
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
      },
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: process.env.LHCI_SERVER_URL,
    },
  },
};

# GitHub Actions
- name: Run Lighthouse CI
  run: |
    npm run build
    npm run start &
    npx lhci autorun
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### Reading Lighthouse Output
```
Score 0-49   → Red    → Failing
Score 50-89  → Orange → Needs improvement
Score 90-100 → Green  → Good

FOCUS ON:
  Opportunities → specific improvements with estimated savings
  Diagnostics   → underlying issues (render-blocking, unused code)
  NOT:
  Score alone    → gaming the score ≠ real improvement
```

## Bundle Analysis

### Run Analysis
```bash
# Next.js built-in
ANALYZE=true npm run build
# Requires: @next/bundle-analyzer in next.config.js

# Check specific package impact
npx bundlephobia [package-name]

# Find what's importing a large package
npx why [package-name]

# Dead code / unused exports
npx ts-prune src

# Duplicate packages (different versions of same lib)
npx npm-dedupe --dry-run
npx depcheck
```

### Bundle Audit Checklist
```bash
# Check these in the bundle analyser:

□ Is moment.js present? Replace with date-fns (tree-shakeable)
□ Is lodash imported as `import _ from 'lodash'`? Switch to `import { pick } from 'lodash-es'`
□ Any library >100KB in client bundle that could be server-only?
□ Are heavy chart libraries loaded on pages that don't need them?
□ Is a library duplicated (two versions in bundle)?
□ Are any polyfills included that modern browsers don't need?
□ Is the entire icon library imported instead of individual icons?

# Target thresholds
Initial JS bundle:    < 100KB (gzipped)
Total JS per page:    < 250KB (gzipped)
Largest single chunk: < 50KB (gzipped)
```

### Common Bundle Wins
```typescript
// BEFORE: imports entire library
import _ from 'lodash'; // 71KB

// AFTER: named import (tree-shakeable with lodash-es)
import { debounce } from 'lodash-es'; // ~1KB

// BEFORE: static import of heavy component
import { RichTextEditor } from '@/components/RichTextEditor';

// AFTER: dynamic import with ssr:false
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <Skeleton className="h-64" />,
});

// BEFORE: import entire icon set
import * as Icons from 'lucide-react'; // 500KB+

// AFTER: named imports only
import { ArrowRight, X, Check } from 'lucide-react'; // ~3KB
```

## React Render Performance Audit

### Setup React DevTools Profiler
```
1. Install React DevTools browser extension
2. Open DevTools → Profiler tab
3. Click "Record"
4. Perform the slow interaction
5. Stop recording
6. Look for: components with long render times, components that render unexpectedly
```

### Reading Profiler Output
```
Flame chart:
  Width    → render duration (wider = slower)
  Color    → how much time relative to others (yellow/red = expensive)
  
Ranked chart:
  Shows components by render time — start fixing from top

What to look for:
  - Component rendering when no relevant props changed → missing memo
  - Component rendering 10x per interaction → upstream state causing cascade
  - render() > 16ms on any component → janky at 60fps
  - Parent rendering causing all children to re-render → missing memo, unstable refs
```

### Common React Performance Issues
```typescript
// ISSUE 1: New object reference on every render
function Parent() {
  // BAD: new object every render → child always re-renders
  return <Child options={{ theme: 'dark' }} />;
  // GOOD:
  const options = useMemo(() => ({ theme: 'dark' }), []);
  return <Child options={options} />;
}

// ISSUE 2: Inline function creates new ref
// BAD: new function every render
<List onItemClick={(id) => handleClick(id)} />
// GOOD:
const handleItemClick = useCallback((id) => handleClick(id), [handleClick]);
<List onItemClick={handleItemClick} />

// ISSUE 3: Context causing full tree re-render
// BAD: single context with frequently-updating value
<UserContext.Provider value={{ user, isLoading, notifications }}>
// notifications updates → entire tree re-renders
// GOOD: split contexts by update frequency
<UserContext.Provider value={user}>
  <NotificationsContext.Provider value={notifications}>

// ISSUE 4: Expensive computation in render
// BAD: computed every render
const sorted = items.slice().sort(compareByDate);
// GOOD:
const sorted = useMemo(() => items.slice().sort(compareByDate), [items]);

// ISSUE 5: Large list without virtualization
// > 200 items rendered: use @tanstack/virtual
```

## Database Query Audit

### Find Slow Queries
```sql
-- Supabase: check slow queries in Dashboard → Database → Query Performance
-- Or via pg_stat_statements

SELECT
  query,
  calls,
  total_exec_time / calls AS avg_ms,
  rows / calls AS avg_rows,
  total_exec_time
FROM pg_stat_statements
WHERE total_exec_time / calls > 100  -- queries averaging >100ms
ORDER BY total_exec_time DESC
LIMIT 20;
```

### EXPLAIN ANALYZE Workflow
```sql
-- Run on any query >50ms
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.id, p.title FROM users u
JOIN posts p ON p.user_id = u.id
WHERE u.org_id = $1
ORDER BY p.created_at DESC
LIMIT 20;

-- Red flags in output:
-- "Seq Scan" on table with >10k rows → needs index
-- "Rows Removed by Filter: 50000" → poor index selectivity  
-- "Sort Method: external merge" → sort spilled to disk, needs work_mem or index
-- Actual rows vs estimated rows wildly different → run ANALYZE tablename
-- "Buffers: read=5000 hit=10" → low cache hit ratio → too many disk reads
```

### N+1 Detection
```typescript
// Add query logging in development
// Count queries per request — any request making >5 queries needs review

// Next.js: log Supabase queries in dev
if (process.env.NODE_ENV === 'development') {
  const originalFrom = supabase.from.bind(supabase);
  supabase.from = (table: string) => {
    console.log(`[DB] Query on: ${table}`);
    return originalFrom(table);
  };
}

// In tests: assert query count
let queryCount = 0;
// instrument supabase client to count
const result = await renderPage('/dashboard');
expect(queryCount).toBeLessThan(5); // fail if N+1 appears
```

### Index Audit
```sql
-- Tables with no indexes (danger zone if >1000 rows)
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT DISTINCT tablename FROM pg_indexes WHERE schemaname = 'public'
  );

-- Unused indexes (wasting write performance)
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE '%pkey%'  -- exclude primary keys
ORDER BY pg_relation_size(indexrelid) DESC;

-- Missing FK indexes
SELECT tc.table_name, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = tc.table_name
      AND indexdef LIKE '%' || kcu.column_name || '%'
  );
```

## API Response Time Audit

```typescript
// Instrument all API routes with timing
// middleware.ts
export async function middleware(request: NextRequest) {
  const start = Date.now();
  const response = await NextResponse.next();
  const duration = Date.now() - start;

  response.headers.set('Server-Timing', `total;dur=${duration}`);

  if (duration > 500) {
    logger.warn({
      action: 'slow_request',
      path: request.nextUrl.pathname,
      duration_ms: duration,
    });
  }

  return response;
}
```

### Response Time Targets
```
P50: < 100ms  (instant feel)
P95: < 500ms  (acceptable)
P99: < 1000ms (degraded)
> 1000ms      → investigate immediately
```

## Perceived Performance Audit

Sometimes the app IS fast but FEELS slow. Check:

```
□ Loading states present for all async operations
□ Skeleton screens for content areas (not just spinners)
□ Optimistic UI for common mutations (like/save/delete)
□ Images have width/height to prevent layout shift
□ Fonts loaded with next/font (eliminates FOUT)
□ Above-fold images have priority={true}
□ Navigation feels instant (Next.js prefetch on hover)
□ Form submissions give immediate feedback
□ Search has debounce (not instant query on keypress)
```

## Audit Report Format
```
METRIC: Largest Contentful Paint
CURRENT: 3.8s (mobile, simulated throttling)
TARGET: < 2.5s
ROOT CAUSE: Hero image (1.2MB) not using next/image — downloaded full size on all devices
RECOMMENDATION: Replace <img src="/hero.jpg"> with <Image priority sizes="100vw" />
ESTIMATED IMPROVEMENT: ~1.5s LCP reduction
EFFORT: Low (30 min)
```
