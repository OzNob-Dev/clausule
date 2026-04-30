---
name: dependency-audit
description: >
  Principal guidance for auditing npm dependencies: bundle impact, security advisories,
  maintenance status, license compliance, whether a native API would suffice, and
  removing unnecessary packages. Load when adding a new dependency, doing a quarterly
  dependency review, evaluating a package for inclusion, or responding to security advisories.
---

# Dependency Audit — Principal Standards

## Philosophy
- **Every dependency is a liability.** It introduces security risk, bundle cost, maintenance burden, and license obligation.
- **Evaluate the native alternative first.** The platform ships more every year.
- **Maintenance matters more than stars.** A popular abandoned package is dangerous.
- **One package, one job.** Never add a 500KB utility for one function.

## Before Adding Any Package

Answer all of these before `npm install`:

```
1. Does a native Web API or Node.js built-in do this?
2. Is this already provided by a package already in the project?
3. What is the bundle size impact? (bundlephobia.com)
4. When was the last release? Any open critical issues?
5. What is the license? Is it compatible with our use?
6. How many dependencies does it introduce? (transitive cost)
7. Is it actively maintained (maintainers responsive to issues)?
8. Could 20 lines of code replace it?
```

## Native Alternatives (Do Not Add a Package For These)

```
TASK                          NATIVE ALTERNATIVE
─────────────────────────────────────────────────────────────────────
UUID generation               crypto.randomUUID()
Date formatting               Intl.DateTimeFormat
Relative time                 Intl.RelativeTimeFormat
Number/currency formatting    Intl.NumberFormat
URL parsing                   URL (new URL(href))
Query string parsing          URLSearchParams
Deep clone                    structuredClone()
Fetch HTTP                    fetch() (native, Node 18+)
Array unique                  [...new Set(arr)]
Array flatten                 arr.flat(depth)
Object entries/keys           Object.entries() / Object.keys()
Base64                        btoa() / atob()
Hash (non-crypto)             crypto.subtle.digest()
Debounce (React)              useDebounce with setTimeout + cleanup
Feature detection             matchMedia(), ResizeObserver, IntersectionObserver
Local storage                 localStorage / sessionStorage (use sparingly)
```

## Bundle Impact Assessment

```bash
# Before installing — check cost
npx bundlephobia [package-name]

# Key metrics to check:
#   Size: minified + gzip (what lands in bundle)
#   Tree-shakeable: can you import just what you need?
#   Side effects: does it self-register globally?

# After installing — verify actual impact
ANALYZE=true npm run build
# Check bundle analyser: is the package only in the expected chunks?
# Is it appearing in client bundle when it should be server-only?
```

### Size Thresholds
```
< 5KB gzipped    → Low impact, proceed
5-20KB gzipped   → Acceptable if genuinely needed
20-50KB gzipped  → Justify carefully, consider alternatives
50-100KB gzipped → Strong justification required, investigate tree-shaking
> 100KB gzipped  → Exceptional cases only (rich editor, PDF renderer, maps)
```

### Common Oversized Packages to Avoid/Replace
```
moment.js (67KB)          → date-fns (tree-shakeable) or Intl
lodash (71KB)             → lodash-es (tree-shakeable) or native
axios (11KB)              → native fetch
jquery                    → never in a React app
validator.js              → Zod (already in project)
classnames / clsx         → cn() utility with tailwind-merge
react-icons (entire set)  → lucide-react with named imports only
```

## Security Audit

### Automated Scanning
```bash
# Run on CI — fail on high/critical
npm audit --audit-level=high

# More detailed (shows paths to vulnerable package)
npm audit --json | npx npm-audit-resolver

# Check against OSV database (broader than npm audit)
npx osv-scanner --lockfile package-lock.json
```

### Manual Security Review for New Packages
```
□ Check the npm page: any security advisories in the last 2 years?
□ Search: "[package-name] vulnerability" or "[package-name] CVE"
□ Check GitHub issues: any open security issues?
□ Check maintainer: is this a single maintainer? (bus factor risk)
□ Check for typosquatting: is the package name suspiciously close to a popular one?
□ Review the install script: does package.json have a "postinstall" script? (supply chain risk)
□ Check perms: does it request network, filesystem, or env access it shouldn't need?
```

### Supply Chain Red Flags
```bash
# Packages with suspicious postinstall scripts
cat node_modules/[package]/package.json | grep -A5 '"scripts"'

# Packages that phone home
# Check network requests during build/test
# Any package calling external URLs during install is suspicious

# Verify package integrity
npm audit signatures
```

## Maintenance Status Assessment

```
HEALTHY signals:
  ✓ Released in last 6 months (or stable with known low change cadence)
  ✓ Issues responded to within weeks
  ✓ >1 active maintainer
  ✓ Changelog maintained
  ✓ Breaking changes documented

WARNING signals:
  ⚠ Last release 6-18 months ago
  ⚠ Open issues unanswered > 6 months
  ⚠ Single maintainer
  ⚠ No response to security reports

ABANDON signals:
  ✗ Last release > 2 years ago (for actively-used packages)
  ✗ Repository archived
  ✗ Known security issue with no fix
  ✗ Maintainer explicitly abandoned project
  ✗ Peer dependencies incompatible with your stack
```

## License Compliance

```
SAFE for commercial projects:
  MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0
  → Use freely, include copyright notice

REVIEW REQUIRED:
  LGPL-2.1, LGPL-3.0
  → Generally OK for use as library, but modifications must be open-sourced
  MPL-2.0
  → File-level copyleft — modifications to MPL files must be open-sourced

DO NOT USE in proprietary code without legal review:
  GPL-2.0, GPL-3.0, AGPL-3.0
  → AGPL particularly dangerous: using AGPL software in a network service
     may require open-sourcing your entire application

CHECK: Creative Commons (CC) licenses — most not suitable for software
```

```bash
# Audit all licenses in project
npx license-checker --summary
npx license-checker --failOn 'GPL-2.0;GPL-3.0;AGPL-3.0'
```

## Removal Audit (Quarterly)

```bash
# Find unused dependencies
npx depcheck

# Find packages only used in tests (should be devDependencies)
# Cross-reference depcheck output with package.json dependencies

# Find duplicate functionality
# e.g., both 'classnames' and 'clsx' installed → remove one

# Find packages that ship a polyfill now in the platform
# e.g., 'uuid' → crypto.randomUUID(), 'node-fetch' → native fetch
```

### Removal Checklist
```
□ Run depcheck — review all flagged unused packages
□ Check if any dependency has a simpler native replacement
□ Check for duplicate packages serving same purpose
□ Check devDependencies vs dependencies split is correct
□ Remove @types/* packages where types now ship with the package
□ Verify tests still pass after removal
□ Verify bundle size improved (ANALYZE=true npm run build)
```

## Package Evaluation Template

```
Package: [name@version]
Purpose: [what specific problem this solves]
Alternatives considered:
  - Native: [why native doesn't work]
  - [Alt 1]: [why rejected]
Bundle size: [KB gzipped] — tree-shakeable: [yes/no]
Last release: [date]
Weekly downloads: [number]
Maintainers: [number]
License: [identifier]
Security: npm audit shows [clean / X vulnerabilities]
Verdict: [APPROVE / REJECT / REVISIT]
```

## Anti-Patterns (Instant Rejection)
- Installing a package to use one utility function (write it instead)
- `import * as X from 'package'` defeating tree-shaking
- Production dependencies in devDependencies (breaks deploys)
- devDependencies in dependencies (bloats production bundle)
- Adding a package without checking bundlephobia first
- Ignoring `npm audit` high/critical findings
- Multiple packages doing the same thing (classnames + clsx + cn)
- AGPL package in commercial application without legal sign-off
- Never running depcheck or removal audit
