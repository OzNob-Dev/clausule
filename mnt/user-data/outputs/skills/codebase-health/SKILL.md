---
name: codebase-health
description: >
  Principal guidance for measuring and maintaining codebase health over time: complexity
  trends, test coverage trends, dependency age, dead code percentage, build time trends,
  periodic health audits, and health metrics CI gates. Load when performing a periodic
  health review, investigating why the codebase feels slow to change, or establishing
  health tracking for a project.
---

# Codebase Health — Principal Standards

## Philosophy
- **Codebase health is a lagging indicator.** By the time it feels bad, it's been declining for months.
- **Measure trends, not snapshots.** A single metric means nothing. Direction and velocity matter.
- **Health review is maintenance, not heroics.** Schedule it. Do it quarterly. Don't wait until it hurts.
- **The goal is changeability.** A healthy codebase is one where engineers can make changes confidently and quickly.

## Health Metrics (Track Over Time)

### Complexity
```bash
# File length distribution — files >200 lines are candidates for splitting
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -30

# Cyclomatic complexity (eslint-plugin-complexity)
# .eslintrc: "complexity": ["warn", { "max": 10 }]
npm run lint -- --rule 'complexity: [warn, 10]' 2>&1 | grep "complexity"

# Deep nesting (eslint: max-depth)
# Flag any function nested >3 levels deep

# Function length
# Flag functions >30 lines — good proxy for "does too much"
```

### Test Coverage
```bash
npm run test -- --coverage

# Focus on: coverage TREND not absolute number
# Track in CI over time:
#   Statements: target >80%, alert if drops >5% week-over-week
#   Branches: target >70% (branches are where bugs live)
#   Functions: target >80%

# More useful than overall: per-module coverage
# Low coverage in auth/ or payments/ = high risk

# Coverage theater check: high coverage with poor tests
# Look for: tests that always pass, tests with no assertions
```

### Build and Test Speed
```bash
# Build time
time npm run build

# Test suite time
time npm run test

# Targets:
#   npm run build:    < 2 minutes
#   npm run test:     < 3 minutes  
#   npm run test:e2e: < 10 minutes
#
# If trending up: find what's slow
#   - New heavy dependency in build?
#   - Slow test suite? Find top 10 slowest tests: vitest --reporter=verbose
#   - Build: check for circular imports, unused re-exports
```

### Dependency Health
```bash
# Outdated packages
npm outdated

# Security vulnerabilities
npm audit

# Unused dependencies
npx depcheck

# License compliance
npx license-checker --summary

# Package age (last publish date)
npx npm-check

# Target:
#   0 critical/high security vulnerabilities
#   0 packages >2 major versions behind
#   < 5 unused dependencies
```

### Dead Code
```bash
# Unused exports (TypeScript)
npx ts-prune src

# Unused files
npx unimported

# Unused CSS classes (if using CSS modules)
npx purgecss --css src/**/*.css --content src/**/*.tsx

# Dead routes (no links pointing to them)
# Manual: search for hrefs to each page route
rg "href.*dashboard" src --include="*.tsx" -l
```

### Type Safety
```bash
# Count any types (trend: should decrease over time)
rg ": any" src --include="*.ts" --include="*.tsx" -c | awk -F: '{sum+=$2} END {print sum}'

# @ts-ignore count
rg "@ts-ignore" src -c | awk -F: '{sum+=$2} END {print sum}'

# Non-null assertions
rg "!$" src --include="*.ts" --include="*.tsx" -c | awk -F: '{sum+=$2} END {print sum}'

# Target: all trending toward 0 over time
```

## Quarterly Health Audit Checklist

Run this every quarter. Takes 2-4 hours. Worth every minute.

```
COMPLEXITY:
□ List top 10 files by line count — any need splitting?
□ List top 10 functions by complexity — any need refactoring?
□ Identify any "no-go zones" (files everyone avoids touching) — plan to fix

TESTS:
□ Run coverage report — which modules are under-covered?
□ Identify flaky tests — fix or quarantine
□ Review test suite speed — any outlier slow tests?
□ Check: are E2E tests still testing what they say they test?

DEPENDENCIES:
□ Run npm outdated — plan upgrades for packages >1 major behind
□ Run npm audit — address all high/critical
□ Run depcheck — remove unused packages
□ Review added packages last quarter — are they all still needed?
□ Check licenses of any new packages added

DEAD CODE:
□ Run ts-prune — clean up unused exports
□ Run unimported — delete unreferenced files
□ Search for feature flags that are 100% rolled out — remove them
□ Search for TODO/FIXME comments — create tasks or delete comments

TYPE SAFETY:
□ Count any types — create tasks to reduce
□ Audit @ts-ignore usages — each one needs a justification or fix
□ Review implicit any in catch blocks — type them as unknown

PERFORMANCE:
□ Measure build time against last quarter
□ Measure test suite time against last quarter
□ Check bundle size against last quarter (ANALYZE=true npm run build)
□ Review Vercel deployment logs for cold start times

DOCUMENTATION:
□ Is README still accurate?
□ Are ADRs up to date for decisions made this quarter?
□ Are any skill files out of date with current conventions?
```

## CI Health Gates

Block merges when these metrics degrade:

```yaml
# .github/workflows/health.yml (runs weekly + on PRs)

- name: Coverage gate
  run: |
    npm run test -- --coverage
    # Fail if coverage drops below threshold
    node -e "
      const c = require('./coverage/coverage-summary.json');
      const stmts = c.total.statements.pct;
      if (stmts < 75) process.exit(1);
    "

- name: Bundle size gate
  run: |
    ANALYZE=true npm run build
    # Compare against baseline stored in artifact
    node scripts/check-bundle-size.js --max-kb 250

- name: Security gate
  run: npm audit --audit-level=high

- name: Dead code gate
  run: |
    npx ts-prune src | grep -v "used in module" | wc -l | \
    awk '{ if ($1 > 20) { print "Too many unused exports: " $1; exit 1 } }'
```

## Technical Debt Register

Maintain a prioritized list of known health issues. Not in code comments — in a tracked place.

```markdown
# Tech Debt Register — /docs/tech-debt.md

## P0 — Must Fix (blocking correctness or security)
| Item | File(s) | Owner | Due |
|------|---------|-------|-----|
| Missing RLS on events table | supabase/migrations/ | @owner | Sprint 12 |

## P1 — Fix This Quarter
| Item | File(s) | Effort | Impact |
|------|---------|--------|--------|
| auth.service.ts >400 lines — split | src/features/auth/server/ | M | High |

## P2 — Fix When Touching
| Item | Notes |
|------|-------|
| 12 uses of `any` in forms/ | Fix when editing those files |

## P3 — Backlog
| Item | Notes |
|------|-------|
| Migrate from classnames to cn() | Low priority, do opportunistically |
```

Update this register in the quarterly audit. Review P0s weekly. Never let P0s sit.

## Health Score (Lightweight Dashboard)

```typescript
// scripts/health-score.ts — run weekly in CI, post to Slack
const metrics = {
  anyTypes: countAnyTypes(),                    // target: 0
  tsIgnores: countTsIgnores(),                  // target: 0
  largFiles: countFilesOver(200),               // target: 0
  unusedExports: countUnusedExports(),           // target: 0
  securityVulns: getAuditVulns('high'),         // target: 0
  coverageStmts: getCoverage().statements,      // target: >80
  buildTimeSeconds: getBuildTime(),             // target: <120
  testTimeSeconds: getTestTime(),               // target: <180
  outdatedMajor: countOutdatedMajor(),          // target: 0
};

// Trend each metric against last week
// Alert if any metric degrades significantly week-over-week
```

## Anti-Patterns
- "We'll clean it up later" (later never comes without scheduling)
- Measuring coverage percentage without reviewing what's tested
- No CI enforcement of health metrics (metrics only in dashboards get ignored)
- Tech debt register that's never reviewed (becomes archaeological artifact)
- Blaming the codebase without measuring (gut feeling is not a health report)
- Addressing symptoms (one big file) without the root cause (no architecture boundaries)
- Health audit that turns into a multi-week refactor (quarterly audit = identify, quarterly sprint = fix top items)
