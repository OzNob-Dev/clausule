---
name: feature-design
description: >
  Principal guidance for the space between "requirement exists" and "implementation starts":
  breaking down features, identifying unknowns, writing tech specs, spike vs build decisions,
  scope negotiation, and estimating confidently. Load when starting a new feature, reviewing
  a tech spec, evaluating scope, or deciding how to break work into tasks.
---

# Feature Design — Principal Standards

## Philosophy
- **Ambiguity is a bug. Resolve it before writing code.** Every hour clarifying upfront saves five hours mid-implementation.
- **Write the spec you wish you'd had.** Future engineers (including you) will read this.
- **Scope is negotiable before implementation, expensive during, and impossible after.**
- **Spikes have time-boxes. Research without a deadline is procrastination.**

## Feature Breakdown Process

When a feature lands in front of you, do this before touching code:

```
1. Restate the problem    → What is actually being solved? (not the proposed solution)
2. Identify users         → Who does this? How often? What do they know?
3. Define done            → What does "complete" look like, specifically?
4. Map the data           → What exists? What's new? What changes?
5. Map the surfaces       → UI screens, API endpoints, DB schema, background jobs
6. Identify unknowns      → What don't you know? What could blow up the estimate?
7. Decide: spike or build → Are unknowns small enough to build around?
8. Slice the work         → Independent shippable pieces
9. Estimate               → With explicit assumptions
10. Write the spec        → Capture decisions and reasoning
```

## Problem Restatement

Before designing, challenge the solution you've been handed:

```
Request: "Add a dashboard showing user activity"

Questions to ask:
  - What decision does the user make with this data?
  - What does "activity" mean specifically?
  - Is this for the user themselves, or for admins watching users?
  - What's the time window? Real-time? Daily digest? Historical?
  - What action does the user take after seeing this?
  - Is there existing data or does new tracking need building?

The answers completely change the implementation.
```

## Tech Spec Structure

Write this before implementation for any feature touching >3 files or taking >1 day:

```markdown
# Tech Spec: [Feature Name]

**Status:** Draft | In Review | Approved | Implemented
**Author:** [name]
**Date:** YYYY-MM-DD
**Reviewers:** [names]

## Problem
One paragraph. What user problem or business need does this solve?
Include: who has the problem, how often, what the current pain is.

## Goals
Bullet list. What will be true when this is done?
- Users can [specific action]
- [Metric] improves from X to Y
- [Edge case] is handled correctly

## Non-Goals
Explicitly what this does NOT include.
This prevents scope creep and sets reviewer expectations.
- Does not include [related feature]
- Does not support [edge case] (see: follow-up task #XXX)

## User Journey
Step-by-step: what does the user actually do?
Include: entry points, decisions, error states, success states.

## Data Model
What tables/columns are new, changed, or read?
Schema changes with rationale.
Migration strategy.

## API Design
New or changed endpoints with request/response shapes.
Auth requirements.
Error cases.

## UI
Key screens or states (can be rough sketch/description).
Component breakdown.
Loading, error, and empty states.

## Implementation Plan
Ordered list of independently shippable tasks.
Each task: what it does, what it depends on, how to test it.

## Open Questions
Things not yet decided. Assigned to someone. Has a deadline.
- [ ] [Question] — @owner — by [date]

## Risks
What could go wrong? What's the mitigation?
- Risk: [X] → Mitigation: [Y]

## Definition of Done
Specific checklist that must pass before feature is complete.
□ [Requirement 1]
□ Tests cover [scenarios]
□ Accessible: [specific checks]
□ Performance: [specific metric]
```

## Identifying Unknowns

Unknowns that must be resolved before estimation are credible:

```
Technical unknowns:
  - "Can Supabase Realtime handle 1000 concurrent subscribers per channel?"
  - "What's the max payload size for Vercel Edge Functions?"
  - "Does this external API support the filtering we need?"

Design unknowns:
  - "What does empty state look like for a first-time user?"
  - "What happens when a user has 0 vs 1 vs 1000 items?"
  - "How does this work on mobile?"

Requirements unknowns:
  - "What does 'active user' mean exactly?"
  - "Should admins see all users' data or just their org?"
  - "What should happen to existing data when this is enabled?"

Dependencies:
  - "Does this require Feature X to ship first?"
  - "Is there a backend API for this or does it need building?"
```

Flag every unknown in the spec. Assign owners. Set deadlines. Unknowns without owners don't get resolved.

## Spike vs Build Decision

```
SPIKE when:
  - Core technical approach is unclear (>2 plausible implementations)
  - External API/service behavior is unknown
  - Performance characteristics are unknown at scale
  - Security implications need investigation
  - A key dependency is untested

SPIKE rules:
  - Time-boxed: 1-4 hours max for most spikes
  - Output: a documented decision, not production code
  - Question defined upfront: "After this spike, I will know [X]"
  - Spike code is throwaway unless explicitly promoted

BUILD when:
  - Technical approach is clear
  - Similar work has been done before
  - Main unknowns are business/design, not technical
```

## Work Slicing (Independent Shippable Pieces)

Good slicing means each slice:
- Can be merged to main without breaking anything
- Can be deployed behind a feature flag if not ready for users
- Has its own tests
- Delivers standalone value or unblocks the next slice

```
BAD SLICING:
  1. "Build the whole feature"
  
ALSO BAD:
  1. Build DB schema
  2. Build API
  3. Build UI
  (Each slice is not independently testable or shippable)

GOOD SLICING:
  1. DB migration: add posts table with RLS (testable in isolation)
  2. API: POST /api/posts (testable with curl/Postman, UI not needed)
  3. API: GET /api/posts with pagination (extends slice 2)
  4. UI: PostList component with loading/error/empty states (works with mock data)
  5. UI: wire PostList to API (first fully-integrated slice)
  6. UI: CreatePost form (adds to slice 5)
  7. Feature: enable behind flag, internal testing
  8. Feature: remove flag, ship to all
```

## Estimation Framework

Estimates are ranges, not points. Always include assumptions.

```
Format:
  Optimistic: X hours (everything goes perfectly)
  Realistic: Y hours (expected with 1-2 small surprises)
  Pessimistic: Z hours (significant unexpected complexity)
  
Assumption list:
  - API for X already exists
  - No DB schema changes needed
  - Design is finalized
  - I'm the only one working on this

If any assumption is wrong, the estimate changes.

Calibration:
  If optimistic = realistic = pessimistic → you have more unknowns than you think
  If pessimistic > 3x optimistic → spike first, then re-estimate
```

## Scope Negotiation

When asked to do too much, too fast:

```
Framework: Must / Should / Could / Won't (MoSCoW)

Must:   Core value. Can't ship without it.
Should: Important but not blocking for v1.
Could:  Nice to have. Cut if time constrained.
Won't:  Explicitly out of scope for now.

Present to stakeholders:
"Here's what I can deliver by [date] (Must + Should).
[Could items] can ship 2 weeks later as a follow-up.
[Won't items] would require [X] additional weeks — should we plan that separately?"

This is negotiation, not pushback. Give options, not refusals.
```

## Definition of Done (Default)

Every feature must meet all of these before "done":

```
□ All Must requirements implemented and verified
□ Unit and integration tests written and passing
□ E2E test for the primary user journey
□ Accessible: keyboard navigable, screen reader tested
□ Mobile: verified at 375px
□ Loading, error, and empty states implemented
□ Analytics events tracked (if applicable)
□ Feature flag removed (if behind one)
□ Tech spec updated to reflect final implementation
□ No TODO comments without linked tasks
□ No console.logs in production paths
□ npm run build, lint, test all pass
□ PR reviewed and approved
□ Product/design sign-off
```

## Anti-Patterns
- Starting implementation before questions are answered
- Tech spec written after implementation ("for documentation")
- Estimates without assumptions stated
- Slices that can't be independently merged
- Spikes without time boxes or defined questions
- "Done" means "code merged" (testing, review, sign-off are part of done)
- Scope added mid-implementation without re-estimating
- Open questions that stay open (assign owners and dates)
