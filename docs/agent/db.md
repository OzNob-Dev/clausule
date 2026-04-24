# Database

- Supabase migrations live in `supabase/migrations`.
- Database access goes through `src/app/api/_lib/supabase.js`.
- Prefer explicit SQL and schema changes over hidden assumptions.

## Rules

- Update migrations for schema changes.
- Keep auth and row-level access rules consistent with the API.
- Treat data shape changes as backward-compatibility risks.
- Review existing migrations before adding a new one.
- Make schema changes in small, reviewable steps.
- Add indexes only when there is a real query path to support.
- Prefer constraints and defaults to application-only enforcement.
- Plan destructive changes as multi-step migrations when possible.

## RLS and Data Safety

- Do not rely on client filters for access control.
- Keep row-level access rules aligned with endpoint ownership.
- Verify that new tables and columns cannot leak data through existing queries.

## Notes

- Migration names are numbered and ordered.
- This repo has legacy duplicate `006_*` filenames; do not rename applied files in place, and use new forward-only migrations plus docs/tests to normalize behavior.
- Database work should include the API and tests that depend on it.
- When a migration changes read or write shape, update the affected route docs and tests.
- Auth challenge tables used for passkeys or SSO should be one-time consumable, cleanup-safe, and service-role only.

## Must Do

- Read the migration chain before adding a new migration.
- Confirm the route layer still matches the new schema shape.
- Verify RLS for new tables or access paths.
- Add the smallest migration that gets the job done.

## Anti-Patterns

- Relying on application code for access control
- Changing a table shape without updating callers
- Shipping destructive SQL in one step when a safer migration path exists
- Adding indexes without a concrete query need

## Repo Anchors

- `supabase/migrations/005_app_feedback.sql`
- `supabase/migrations/006_app_feedback_remove_is_action.sql`
- `supabase/migrations/007_app_feedback_replies.sql`
