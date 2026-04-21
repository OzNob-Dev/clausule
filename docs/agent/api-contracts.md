# API Contracts

- Keep request and response shapes stable unless a migration plan exists.
- Validate inputs at the boundary and normalize outputs consistently.
- Treat API changes as versioned compatibility risks.

## Rules

- Document required and optional fields in code or tests.
- Preserve backward compatibility for existing callers when possible.
- Return predictable status codes and error shapes.
- Keep route handlers thin and contract-focused.

## Review Triggers

- Public or shared endpoints
- Response shape changes
- Pagination or filtering changes
- New required fields
