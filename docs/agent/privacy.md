# Privacy

- Treat personal data, credentials, tokens, and user-generated content as sensitive by default.
- Minimize collection, storage, retention, and exposure of PII.
- Do not log, echo, or surface unnecessary personal data in errors, analytics, or UI.

## PII Rules

- Collect only what the feature needs.
- Prefer pseudonymous or aggregated data where possible.
- Redact PII in logs, tests, screenshots, and support output.
- Delete or anonymize data when the feature no longer needs it.

## Review Triggers

- Profile fields
- Email, phone, name, and account identifiers
- Payments and billing
- Support or audit logs
- Export, retention, and deletion flows

## Repo Anchors

- `src/features/auth/store/useProfileStore.js`
- `src/app/api/auth/register/route.js`
- `src/features/brag/components/DeleteAccountModal.jsx`
- `src/features/brag/server/appFeedback.js`
