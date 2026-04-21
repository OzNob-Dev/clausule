# Feature Flags

- Use flags to reduce rollout risk, not to postpone decisions indefinitely.
- Prefer simple enable/disable controls with a clear owner and expiry.

## Rules

- Keep flag scope narrow.
- Make default-off risky changes reversible.
- Remove stale flags after rollout.
- Document who owns the flag and when it should be deleted.

## Review Triggers

- Gradual rollouts
- Experimental UI or workflows
- Kill switches
- Backend behavior changes

## Repo Anchors

- `src/shared/utils/sso.js`
- `src/features/brag/components/SsoStatusSection.jsx`
- `src/features/brag/components/MfaSecuritySection.jsx`
