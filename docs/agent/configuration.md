# Configuration

- Keep runtime config explicit and documented.
- Treat environment variables as part of the contract.
- Separate public config from server-only secrets.

## Known Environment Areas

- Auth and sessions
- Manual auth testing override: `NEXT_PUBLIC_AUTH_TEST_BYPASS=employee` in non-production only
- Supabase
- SSO providers
- Email delivery
- Payments
- AI integrations
- WebAuthn and MFA

## Rules

- Document new env vars where they are consumed.
- Fail clearly when required config is missing.
- Do not leak secret values in logs or client code.
- Prefer feature flags for product toggles, not env hacks.

## Review Triggers

- New env var usage
- Deployment configuration
- Secret rotation
- Third-party integration changes

## Repo Anchors

- `src/app/api/_lib/supabase.js`
- `src/app/api/_lib/jwt.js`
- `src/features/auth/server/ssoProviders.js`
- `src/app/api/ai/draft-summary/route.js`
- `src/features/brag/server/appFeedback.js`
