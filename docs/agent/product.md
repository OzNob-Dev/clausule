# Product

- This app centers on brag documents, feedback, manager review, and account security.
- Use the product’s real terms consistently across UI, API, tests, and docs.
- Keep the employee, manager, and shared auth surfaces conceptually separate.
- This doc also owns the domain model.

## Core Concepts

- Brag doc: a user-owned record of wins, evidence, and resume-ready output.
- Feedback: structured input about blockers, outcomes, and improvement ideas.
- Manager tools: review, escalation, and employee oversight workflows.
- Security: sign-in, sessions, MFA, passkeys, SSO, and account recovery.

## Invariants

- A user’s brag entries belong to that user unless the feature explicitly crosses roles.
- Sensitive account actions require clear confirmation and auth checks.
- Manager-facing workflows should not silently alter employee-owned content.
- Feedback and escalation should preserve enough context to be useful without overexposing PII.

## Domain Model

- Brag doc: a user-owned record of wins, evidence, and resume-ready output.
- Entry: a single brag record with title, date, body, strength, and evidence.
- Evidence: proof attached to an entry, such as metrics, artefacts, or links.
- Feedback: structured input about blockers, outcomes, and improvement ideas.
- Escalation: a formal manager or HR review workflow.
- Manager tools: review, escalation, and employee oversight workflows.
- Security: sign-in, sessions, MFA, passkeys, SSO, and account recovery.

## Vocabulary

- Prefer "brag doc" over vague "profile" language when referring to achievements.
- Prefer "feedback" for product input and "escalation" for formal manager/HR review.
- Prefer "employee" and "manager" when role clarity matters.
- Prefer "entry" for a single brag record and "evidence" for supporting proof.

## Review Checks

- Does the change use the app’s own terms consistently?
- Does the behavior match the role boundaries?
- Does the feature protect user-owned content and sensitive data?
- Would a new team member understand the product meaning from the doc alone?
