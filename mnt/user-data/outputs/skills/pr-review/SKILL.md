---
name: pr-review
description: >
  Principal PR review methodology: what to look for in what order, how to frame feedback
  constructively, what blocks merge vs advisory, reviewing for correctness vs style vs
  security vs performance, and how to review different sizes of PR. Load when reviewing
  any pull request or when structuring code review feedback.
---

# PR Review — Principal Standards

## Review Philosophy
- **Reviews serve the codebase, not egos.** The goal is correct, maintainable software — not demonstrating expertise.
- **Be specific and actionable.** Every comment either explains the issue or suggests the fix. Never both vague and blocking.
- **Distinguish blocking from advisory.** Not everything needs to be fixed before merge.
- **Assume good intent.** Ask questions before assuming mistakes. Context you lack may exist.
- **Review the diff, not the person.** "This function is hard to follow" not "You wrote confusing code."

## Review Order (Fastest Signal First)

```
1. Understand intent first    → Read PR description before the diff
2. Tests                      → What does the test suite tell you about behavior?
3. Interfaces/contracts       → Types, API shapes, function signatures
4. Business logic             → Is the core behavior correct?
5. Security                   → Auth, validation, secrets, IDOR
6. Error handling             → What happens when things go wrong?
7. Performance                → Any obvious bottlenecks?
8. Code style/quality         → Naming, structure, readability
```

Never start with style — it's the least important and most subjective.

## Blocking vs Advisory

### Always Block
```
□ Security vulnerability (auth bypass, injection, exposed secrets)
□ Data loss risk (missing transaction, wrong delete scope)
□ Incorrect business logic (does the wrong thing)
□ Breaking change without migration path
□ Missing auth/authorization check
□ Sensitive data logged or exposed in response
□ Race condition or data consistency issue
□ Tests that don't actually test the behavior claimed
□ New tech debt introduced without justification (TODO without task, any type, magic value)
```

### Block with Discussion
```
□ Missing test coverage for a critical path
□ N+1 query that will hurt at scale
□ Architecture decision that creates future coupling
□ Missing error handling on a user-facing path
□ Accessibility issue that breaks keyboard/screen reader access
```

### Advisory Only (Don't Block)
```
~ Style preferences (when linter passes)
~ Alternative implementation approaches (not objectively better)
~ Minor naming improvements
~ Performance micro-optimizations (profile first)
~ "I would have done it differently" without clear objective reason
~ Suggestions for future improvements (suggest a follow-up task instead)
```

Mark advisory comments clearly:
```
nit: consider renaming this to `isExpired` for clarity
optional: could extract this into a shared utility if it comes up elsewhere
suggestion: a state machine might simplify this in future
```

## PR Size Handling

### Small (< 100 lines changed)
- Full line-by-line review
- Expect review in < 2 hours
- Higher bar for blocking — context is limited, risk is lower

### Medium (100–400 lines)
- Full review, may take a day
- Start with architecture/approach before line-level
- Flag if scope is larger than described

### Large (400–1000 lines)
- Request breakdown if possible before reviewing
- Focus on: architecture, security, correctness — not style
- Comment: "This is hard to review at this size — can you split [X] from [Y]?"
- If can't split: review in passes (architecture → logic → security → style)

### Too Large (> 1000 lines)
```
// Comment on the PR:
"This PR is too large to review effectively. At this size, I can't
guarantee I'll catch everything. Please split into:
1. [Logical split 1] 
2. [Logical split 2]

This reduces risk and makes review faster for both of us."
```

Only exception: auto-generated files (migrations, lock files, generated types).

## Review Checklist by Category

### Correctness
```
□ Does it do what the PR description says?
□ Edge cases handled: empty arrays, null/undefined, 0, empty string
□ Off-by-one errors in loops, pagination, indexes
□ Async handling: awaits present, errors caught, race conditions absent
□ State transitions: can this reach an invalid state?
□ Data mutations: is the correct record being modified?
```

### Security
```
□ Auth check before any data access (not just at route level)
□ Authorization: ownership verified, not just authentication
□ User input validated with schema (Zod) before use
□ No secrets, tokens, or PII in logs or responses
□ No SQL/query interpolation with user input
□ No mass assignment (spread of request body into DB update)
□ Open redirect check (redirect targets validated)
□ File uploads: type validated by content, not extension
□ Webhook: signature verified before processing
```

### Testing
```
□ Tests cover the actual behavior, not just execution paths
□ Error paths tested, not just happy paths
□ Edge cases in tests match edge cases in implementation
□ Tests are not brittle (won't fail on unrelated changes)
□ No mocked internals that make tests pass while behavior is wrong
□ Test names describe behavior, not implementation
```

### Performance
```
□ No N+1 queries introduced
□ No missing index on a new filter/sort column
□ Heavy operations not running synchronously in request cycle
□ No unbounded queries (LIMIT present on all lists)
□ Images use next/image with correct sizes
□ No new large dependencies without bundle impact check
```

### Accessibility
```
□ New interactive elements keyboard accessible
□ New form fields have labels
□ New dynamic content has aria-live or focus management
□ New images have alt text
□ New icons are aria-hidden or have aria-label
```

### Tech Debt
```
□ No TODO comments without linked task
□ No new 'any' types
□ No magic numbers/strings (use named constants)
□ No commented-out code
□ No console.log in production paths
□ No dead imports or exports
```

## Feedback Framing

### Structure of a Good Review Comment
```
[What] + [Why] + [How]

WEAK: "This is confusing"

STRONG: "The `data` variable name is ambiguous here — it could be
         the raw response or the parsed domain object. Renaming to
         `rawResponse` and `userRecord` would make the transformation
         clear at a glance."

WEAK: "Needs tests"

STRONG: "The error path (when `stripe.subscriptions.create` throws) has
         no test. Stripe errors are common enough (network, invalid card)
         that this should be covered — especially since it affects billing."
```

### Asking vs Telling
```
When you're not sure why something was done:
"I'm not following why X — could you explain the reasoning?"

When you see a definite issue:
"This will N+1 on the posts query because [reason]. Fix: batch with userIds IN [...]"

When suggesting (not blocking):
"nit: `getUserById` might read more clearly as `findUserById` since it
returns null instead of throwing — just a suggestion."
```

### Praise
Genuine, specific praise is valuable. Teaches what good looks like and signals what to keep doing.
```
"Nice — handling the abort signal here is easy to miss. Good catch."
"Extracting this into `buildQueryParams` makes the route handler much cleaner."
```

Empty praise ("looks good!", "great work") signals you didn't look carefully.

## Self-Review Before Submitting (For PR Author)

Run this before requesting review — saves reviewer time:

```
□ PR description explains: what changed, why, how to test
□ Diff reviewed by me first (I've read every line)
□ No debug code, console.logs, or temporary hacks left in
□ Tests added or updated
□ No TODO without a linked issue
□ No any types
□ `npm run build` passes
□ `npm run lint` passes
□ `npm run test` passes
□ Screenshots/video for visual changes
□ Migration run and verified if DB changes
□ Breaking changes documented and migration path included
```

## Anti-Patterns (Both Reviewer and Author)

**Reviewer:**
- Blocking on style preferences when linter passes
- Rewriting the PR in comments ("I would have done this instead...")
- Late-breaking architecture feedback on large PRs (should be caught earlier)
- No feedback at all — just "LGTM" on complex changes
- Passive-aggressive phrasing ("Why didn't you just...")
- Comments without explanation ("this is wrong")

**Author:**
- PR description that just says "fixes bug" or "adds feature"
- No tests because "it's a small change"
- Combining refactor + feature in one PR
- 1500-line PRs
- No self-review before requesting review
- Merging without addressing blocking comments
