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
- Keep unauthenticated account-discovery surfaces minimal and generic.
- Keep one-time auth challenges server-stored or otherwise one-time consumable.
- Verify upstream identity tokens and assertions cryptographically; decoding a JWT or WebAuthn payload is never sufficient proof.
- Treat WebAuthn registration as a verified ceremony: require and validate `attestationObject` or equivalent registration proof before persisting a credential.
- In production, resolve WebAuthn RP ID and origin from trusted configuration, not request headers.

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

- Keep secret material server-only and short-lived where possible.
- Require proof of identity before creating durable unauthenticated account state.
- Verify RP/origin binding, user verification, signature validity, and replay counters before issuing a passkey session.
- Verify passkey registration proof before storing the public key or credential ID.
- Sanitize AI-provider and third-party error logging so user content is not echoed into server logs.
- Verify Apple or other IdP identity tokens for signature, issuer, audience, expiry, and required claims before trusting email or subject identifiers.
- Ensure one auth method cannot silently bypass another required method.
- Keep canonical account-state rules consistent across login, refresh, bootstrap, and protected endpoints.

## Anti-Patterns

- Logging tokens, secrets, or full payloads
- Using client-side checks for access control
- Expanding cookie scope without reason
- Returning internal auth state to the browser
- Letting signup, checkout, or recovery flows mint sessions for existing accounts without checking allowed auth methods
- Letting signup, checkout, or subscription finalization reactivate soft-deleted accounts without an explicit recovery flow
- Accepting client-supplied WebAuthn registration material without attestation validation
- Trusting decoded third-party JWT payloads without cryptographic verification
