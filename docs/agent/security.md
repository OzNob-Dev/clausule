# Security

- Auth is mandatory for user-scoped endpoints.
- Never commit secrets or hard-coded credentials.
- Do not weaken authorization, session, or rate-limit checks.

## Rules

- Validate input at the boundary.
- Prefer least privilege.
- Keep sensitive data out of logs and UI.
- Treat account, MFA, passkey, and payment flows as high-risk changes.
- Follow `docs/agent/privacy.md` for PII handling and data minimization.
- Never expose server-only secrets to client code.
- Keep session cookies and token handling explicit and bounded.
- Preserve existing auth failure behavior unless the change is deliberate.
- Keep unauthenticated account-discovery endpoints minimal; return only the next allowed auth step, not internal account state.
- Keep WebAuthn challenges server-stored or otherwise one-time consumable; signed client state alone is not enough for replay safety.

## High-Risk Areas

- Session creation and refresh
- Passwordless and MFA flows
- Passkeys and WebAuthn
- Account deletion and recovery
- Payment and subscription actions
- AI or email integrations that may surface user content

## Review Triggers

- Session handling
- Passwordless or MFA flows
- Supabase auth or RLS changes
- Account deletion or profile updates
- External integrations and webhooks
- Anything that changes cookie flags, token lifetime, or auth scope

## Must Do

- Review `src/app/api/_lib/auth.js` before changing cookies or token logic.
- Treat `src/features/auth/server/*` and `src/features/mfa/*` as security-sensitive.
- Check whether a change could expose profile, feedback, or entry content.
- Keep secret material server-only and short-lived where possible.
- Do not expose matched account existence or exact SSO provider identity to unauthenticated callers.
- Require proof of email possession before creating durable signup accounts or other unauthenticated account state.
- Treat passkey assertion verification as a full sign-in path: verify RP/origin binding, user verification flags, signature validity, and sign-count monotonicity before issuing a session.

## Anti-Patterns

- Logging tokens, secrets, or full payloads
- Using client-side checks for access control
- Expanding cookie scope without reason
- Returning internal auth state to the browser
