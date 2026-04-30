---
name: security-audit
description: >
  Principal security audit methodology covering OWASP Top 10 mapped to Next.js/Supabase,
  specific attack vectors (SSRF, mass assignment, IDOR, open redirects, header injection),
  Supabase-specific pitfalls, and a structured review checklist. Load when performing
  a security review, auditing auth flows, reviewing API routes, or doing a pre-release
  security pass on any feature touching auth, data, payments, or user input.
---

# Security Audit — Principal Standards

## Audit Methodology

Run in this order — cheapest checks first:

```
1. Static scan      → grep/rg for known bad patterns (minutes)
2. Data flow        → trace untrusted input from entry to sink (15-30 min)
3. Auth boundary    → every route, action, RPC — is auth checked? (15 min)
4. Authorization    → every data access — is ownership verified? (15 min)
5. Secret exposure  → env vars, logs, responses (10 min)
6. Dependency scan  → npm audit, known CVEs (5 min)
7. Manual testing   → auth bypass attempts, injection, IDOR (30+ min)
```

## Static Scan Patterns (Run First)

```bash
# Secrets in code
rg "sk_live|sk_test|whsec_|service_role|eyJhbGc" --type ts
rg "process\.env\." src/app --include="*.tsx" # client bundle exposure check

# console.log in production paths
rg "console\.log" src --include="*.ts" --include="*.tsx" -l

# Any type usage
rg ": any" src --include="*.ts" --include="*.tsx" -c

# Raw SQL interpolation
rg '\$\{' src --include="*.ts" -l | xargs rg "SELECT|INSERT|UPDATE|DELETE"

# Disabled auth
rg "skipAuth|bypassAuth|noAuth|TODO.*auth|FIXME.*auth" src -i

# Unsafe innerHTML
rg "dangerouslySetInnerHTML" src --include="*.tsx"

# Missing await on auth checks
rg "requireAuth\(\)" src --include="*.ts" | grep -v "await"

# Direct service_role usage in client files
rg "SERVICE_ROLE" src/app --include="*.tsx"

# Open redirects
rg "redirect\(.*req\." src --include="*.ts"
rg "router\.push.*searchParams" src --include="*.tsx"
```

## OWASP Top 10 — Next.js/Supabase Mapping

### A01: Broken Access Control
```
CHECK:
□ Every API route has auth check before data access
□ Every server action has auth check
□ Data queries filter by userId/orgId — not just route-level auth
□ Supabase RLS enabled on all user-scoped tables
□ Admin routes protected with role check, not just auth check
□ IDOR: resource IDs validated against owner, not just existence

SUPABASE SPECIFIC:
□ RLS policies test-verified (not just assumed correct)
□ service_role client never used in user-facing routes without explicit justification
□ No .from('users').select('*') returning all users without RLS
□ Realtime subscriptions only on RLS-protected tables

NEXT.JS SPECIFIC:
□ Server actions validate session before mutation
□ Route params (userId, postId) verified against DB ownership, not trusted from URL
□ Layout auth checks cannot be bypassed by direct page navigation
□ middleware.ts covers all protected route patterns (no gaps)
```

### A02: Cryptographic Failures
```
CHECK:
□ Passwords: bcrypt/Argon2id only (Supabase handles this — verify not bypassed)
□ One-time tokens: cryptographically random (crypto.randomBytes, not Math.random)
□ JWT verification: signature verified, not just decoded
□ Sensitive data encrypted at rest (Supabase storage: verify bucket policies)
□ No sensitive data in URL params (visible in logs, referrer headers)
□ HTTPS enforced — no HTTP fallback in production
□ Cookies: HttpOnly, Secure, SameSite=Lax minimum
```

### A03: Injection
```
CHECK:
□ All Supabase queries use parameterized SDK methods (no raw SQL with interpolation)
□ .rpc() calls use parameterized args, not string-built queries
□ User input never interpolated into filter strings
□ Email content sanitized before rendering (re-injection via email templates)
□ Log statements don't interpolate user input unsanitized
□ File paths never constructed from user input
□ No eval(), new Function(), or dynamic require() with user input
```

### A04: Insecure Design
```
CHECK:
□ Rate limiting on auth endpoints (login, register, reset, OTP)
□ Account enumeration prevented (consistent timing + messaging on auth failures)
□ One-time tokens are single-use (consumed on first use)
□ Password reset tokens expire (15-60 min max)
□ Concurrent session limits enforced if required
□ Brute force protection on sensitive operations
□ Soft-deleted accounts not silently reactivated via login/signup
```

### A05: Security Misconfiguration
```
CHECK:
□ No debug endpoints in production (e.g., /api/debug, /api/test)
□ Error responses don't expose stack traces, DB errors, or internal paths
□ CORS: explicit allowlist, no wildcard * in production
□ Security headers present (X-Content-Type-Options, X-Frame-Options, CSP)
□ Vercel.json security headers applied
□ Supabase: email confirmation required for signup (not disabled)
□ Supabase: leaked password protection enabled
□ NODE_ENV checks not used as security gates (use explicit env var)
```

### A06: Vulnerable and Outdated Components
```bash
npm audit --audit-level=high
npx audit-ci --high

# Check for known-vulnerable patterns
rg "jsonwebtoken" package.json  # old versions have critical CVEs
rg "axios" package.json         # check version for SSRF issues
```

### A07: Identification and Authentication Failures
```
CHECK:
□ Session tokens: not in localStorage (XSS steals them)
□ Session tokens: not in URL params (logged, leaked via referrer)
□ Session invalidated on logout (not just cookie cleared client-side)
□ Session invalidated on password change
□ Supabase: getUser() used server-side, not getSession() (getSession is unverified)
□ Multi-device sessions: logout one vs logout all behaviour intentional
□ OAuth state parameter validated (CSRF protection)
□ Email verification enforced before full access
```

### A08: Software and Data Integrity Failures
```
CHECK:
□ Webhook signatures verified before processing payload
□ Stripe: webhook signature verified (not just parsing the body)
□ npm packages: lock file committed, CI uses npm ci
□ GitHub Actions: pinned action versions (not @latest)
□ Supabase Edge Functions: auth header verified before processing
□ File uploads: content validated by magic bytes, not extension
```

### A09: Security Logging and Monitoring Failures
```
CHECK:
□ Auth failures logged (with IP, user agent — without credentials)
□ Auth successes logged
□ Permission denials logged
□ Admin actions logged
□ Logs don't contain passwords, tokens, session IDs, PII
□ Alerts configured for: auth failure spike, rate limit abuse, error rate spike
□ Correlation IDs on all requests (enables incident investigation)
```

### A10: Server-Side Request Forgery (SSRF)
```
CHECK:
□ Any endpoint that fetches a URL provided by user input
□ Webhooks that call back to user-supplied URLs: validate domain allowlist
□ Import-from-URL features: validate and restrict
□ Metadata endpoint protection (cloud provider metadata: 169.254.169.254)

PATTERN TO FLAG:
// DANGEROUS
const response = await fetch(req.body.url);

// SAFE
const ALLOWED_DOMAINS = ['api.stripe.com', 'api.github.com'];
const url = new URL(req.body.url);
if (!ALLOWED_DOMAINS.includes(url.hostname)) throw new ValidationError('Domain not allowed');
```

## Supabase-Specific Pitfalls

```
PITFALL 1: RLS policies that look right but aren't
  -- BROKEN: checks auth.uid() but doesn't restrict to owned rows
  CREATE POLICY "users_select" ON posts FOR SELECT USING (auth.uid() IS NOT NULL);
  -- CORRECT: restricts to own rows
  CREATE POLICY "users_select_own" ON posts FOR SELECT USING (auth.uid() = user_id);

PITFALL 2: service_role bypasses RLS — any query with service_role sees ALL rows
  -- Always audit: where is createAdminClient() used? Is it justified?

PITFALL 3: getSession() vs getUser() on server
  -- getSession() reads from cookie and DOES NOT verify with Supabase server
  -- An attacker can forge a session cookie that getSession() accepts
  -- Always use getUser() for server-side auth checks

PITFALL 4: Realtime on tables without RLS
  -- All rows broadcast to all subscribers if RLS not configured for realtime

PITFALL 5: Storage bucket policies
  -- Public buckets: anyone with the URL can access
  -- Always verify bucket is private for user-specific files
  -- Verify storage RLS policies match table RLS policies

PITFALL 6: Edge Function auth
  -- Edge Functions run with service_role by default
  -- Must verify Authorization header manually if user-scoped
```

## Next.js-Specific Pitfalls

```
PITFALL 1: Server action without auth check
  'use server';
  export async function deletePost(id: string) {
    // MISSING: session check — any authenticated user can delete any post
    await db.from('posts').delete().eq('id', id);
  }

PITFALL 2: Open redirect via next/navigation
  // DANGEROUS: user controls destination
  const returnUrl = searchParams.get('returnUrl');
  redirect(returnUrl); // can redirect to evil.com

  // SAFE: validate origin
  const returnUrl = searchParams.get('returnUrl') ?? '/dashboard';
  const isInternal = returnUrl.startsWith('/') && !returnUrl.startsWith('//');
  redirect(isInternal ? returnUrl : '/dashboard');

PITFALL 3: Dynamic route params trusted without DB ownership check
  // DANGEROUS
  const { data } = await supabase.from('posts').select().eq('id', params.id).single();
  // User can guess any ID and access it if RLS not configured

PITFALL 4: Middleware gaps
  // Protected routes defined as: /dashboard, /settings
  // But: /dashboard%2e and /DASHBOARD may not match
  // Always test middleware with encoded and cased variants

PITFALL 5: Client component importing server-only modules
  'use client';
  import { createAdminClient } from '@/utils/supabase/admin'; // EXPOSES service_role KEY
```

## Mass Assignment

```typescript
// DANGEROUS: spread request body directly onto DB insert
const body = await request.json();
await supabase.from('users').update(body).eq('id', userId);
// Attacker can set: { role: 'admin', stripeCustomerId: 'cus_attacker' }

// SAFE: explicit field allowlist
const { name, bio, avatarUrl } = await request.json();
await supabase.from('users').update({ name, bio, avatarUrl }).eq('id', userId);
// Or use Zod schema to define allowed fields
const updateSchema = z.object({ name: z.string(), bio: z.string().optional() }).strict();
const validated = updateSchema.parse(body);
```

## Audit Output Format

```
SEVERITY: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)

Finding:
  File: src/app/api/posts/route.ts:34
  Severity: P0
  Category: Broken Access Control (A01)
  Issue: Server action deletes post without verifying ownership
  Attack: Authenticated user can delete any user's post by supplying arbitrary ID
  Fix: Add `.eq('user_id', session.user.id)` to delete query, or verify ownership first
```
