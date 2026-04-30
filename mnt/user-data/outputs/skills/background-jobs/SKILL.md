---
name: background-jobs
description: >
  Principal guidance for background job design, queue patterns, worker architecture,
  idempotency, retry strategies, poison messages, dead letter queues, cron jobs,
  and reliability patterns. Load when designing jobs, queue-backed workflows,
  scheduled tasks, or any async processing outside the request/response cycle.
---

# Background Jobs — Principal Standards

## Philosophy
- **Jobs fail. Design for it.** Every job must be safe to retry.
- **Idempotency is non-negotiable.** Running a job twice must produce the same result as running it once.
- **Durable before side effects.** Mark job as processing in DB before calling Stripe, sending email, etc.
- **Poison messages kill workers.** Every job needs a maximum retry count and a dead letter queue.

## Job Types
```
Immediate async     → Triggered by user action, processed ASAP (send welcome email, provision resource)
Scheduled / Cron    → Time-based, recurring (daily digest, cleanup old records, usage rollup)
Fan-out             → One event spawns N jobs (notify all subscribers, batch export)
Long-running        → Multi-step, resumable (data migration, bulk import/export)
Webhook delivery    → Retry-with-backoff delivery to external endpoints
```

## Queue Options (Supabase/Next.js Stack)
```
Inngest             → Recommended. Type-safe, built-in retry/DLQ, local dev, step functions
Trigger.dev         → Similar to Inngest, good DX
Upstash QStash      → Serverless HTTP queue, good for webhooks and simple jobs
Supabase pg_cron    → For DB-level scheduled tasks (cleanup, rollups). No application logic.
Vercel Cron         → Simple time triggers. Hits an HTTP endpoint. No queue semantics.
```

For complex multi-step jobs: Inngest. For simple DB maintenance: pg_cron. For HTTP-based delivery: QStash.

## Inngest Pattern

```typescript
// src/jobs/send-welcome-email.ts
import { inngest } from '@/shared/utils/inngest';

export const sendWelcomeEmail = inngest.createFunction(
  {
    id: 'send-welcome-email',
    retries: 3,
    throttle: { limit: 100, period: '1m' },  // 100/min max
  },
  { event: 'user/registered' },
  async ({ event, step }) => {
    const { userId } = event.data;

    // step.run = automatically retried, result cached on success
    const user = await step.run('fetch-user', async () => {
      const u = await userRepo.findById(userId);
      if (!u) throw new NonRetryableError(`User ${userId} not found`);
      return u;
    });

    await step.run('send-email', async () => {
      await emailService.sendWelcome(user);
    });

    await step.run('mark-onboarding-started', async () => {
      await userRepo.update(userId, { onboardingStartedAt: new Date() });
    });
  }
);

// Triggering from a server action
await inngest.send({
  name: 'user/registered',
  data: { userId: user.id },
});
```

## Idempotency

Every job must be idempotent. Running it N times = same result as running once.

```typescript
// Pattern 1: Idempotency key — check before executing
async function sendInvoice(invoiceId: string) {
  // Check if already sent
  const invoice = await invoiceRepo.findById(invoiceId);
  if (invoice.sentAt !== null) {
    logger.info({ invoiceId, action: 'invoice_already_sent_skip' });
    return; // Safe no-op
  }

  // Do the work
  await emailService.sendInvoice(invoice);

  // Mark as done — idempotency anchor
  await invoiceRepo.update(invoiceId, { sentAt: new Date() });
}

// Pattern 2: Upsert instead of insert
await db.from('job_results')
  .upsert(
    { job_id: jobId, result: 'completed', completed_at: new Date() },
    { onConflict: 'job_id' }  // safe to run twice
  );

// Pattern 3: SELECT FOR UPDATE to prevent concurrent execution
await db.rpc('claim_job', { job_id: jobId });
// RPC uses: SELECT ... FOR UPDATE SKIP LOCKED
```

## Retry Strategy

```typescript
// Exponential backoff with jitter
function retryDelay(attempt: number): number {
  const base = 1000; // 1s
  const max = 300_000; // 5 min cap
  const delay = Math.min(base * 2 ** attempt, max);
  const jitter = Math.random() * delay * 0.2; // ±20% jitter
  return delay + jitter;
}

// Retry budget per job type
const RETRY_CONFIG = {
  email: { maxAttempts: 3, delay: 'exponential' },
  webhook: { maxAttempts: 10, delay: 'exponential' },
  payment: { maxAttempts: 5, delay: 'exponential' },
  cleanup: { maxAttempts: 2, delay: 'fixed' },
} as const;
```

### What to Retry vs Not
```
RETRY:
  ✓ Network timeouts and 5xx errors
  ✓ Rate limit responses (429) — respect Retry-After header
  ✓ Transient DB errors
  ✓ External service unavailable (503)

DO NOT RETRY (NonRetryableError):
  ✗ 4xx client errors from external services
  ✗ Record not found (won't appear on retry)
  ✗ Validation failures (won't pass on retry)
  ✗ Business rule violations (state won't change on retry)
```

## Dead Letter Queue (DLQ)

Every queue needs a DLQ. Failed jobs after max retries land here.

```typescript
// DLQ handler — alert + preserve for manual investigation
export const dlqProcessor = inngest.createFunction(
  { id: 'dlq-processor' },
  { event: 'inngest/function.failed' },
  async ({ event }) => {
    const { function_id, error, run_id } = event.data;

    // Alert on-call
    await alertingService.send({
      severity: 'high',
      title: `Job failed after all retries: ${function_id}`,
      body: error.message,
      runId: run_id,
    });

    // Persist for manual replay
    await dlqRepo.create({
      jobId: function_id,
      runId: run_id,
      error: error.message,
      payload: event.data,
      failedAt: new Date(),
    });
  }
);
```

Rules:
- DLQ must be monitored. Alert on every new entry.
- DLQ records must be replayable. Store full original payload.
- DLQ records must be auditable. Store error, timestamp, attempt count.
- Regularly review DLQ. If same job keeps failing → fix the root cause.

## Cron Jobs (Scheduled Tasks)

```typescript
// Inngest — scheduled function
export const dailyCleanup = inngest.createFunction(
  { id: 'daily-cleanup', retries: 1 },
  { cron: '0 2 * * *' }, // 2am UTC daily
  async ({ step }) => {
    await step.run('delete-expired-sessions', async () => {
      await db.from('sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());
    });

    await step.run('delete-expired-tokens', async () => {
      await db.from('verification_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());
    });
  }
);

// Supabase pg_cron — for pure DB operations
SELECT cron.schedule(
  'delete-soft-deleted-users',
  '0 3 * * *',  -- 3am UTC daily
  $$
    DELETE FROM users
    WHERE deleted_at < NOW() - INTERVAL '90 days';
  $$
);
```

Cron rules:
- All cron times in UTC. Document local time equivalent in comment.
- Cron jobs must be idempotent.
- Log start, end, and record count for every cron run.
- Alert if cron doesn't run (missed schedule = silent failure).
- Maximum 1 concurrent instance. Use advisory locks if needed.

## Long-Running Jobs (Step Functions)

```typescript
// Multi-step with checkpointing — safe to resume after failure
export const bulkEmailExport = inngest.createFunction(
  { id: 'bulk-email-export', retries: 2, timeout: '30m' },
  { event: 'export/requested' },
  async ({ event, step }) => {
    const { exportId, userId } = event.data;

    // Step 1 — each step is a checkpoint
    const emails = await step.run('fetch-emails', async () => {
      return emailRepo.findAllForUser(userId);
    });

    // Step 2 — process in chunks, not all at once
    const chunks = chunk(emails, 100);
    for (const [i, chunk] of chunks.entries()) {
      await step.run(`process-chunk-${i}`, async () => {
        await exportService.processChunk(exportId, chunk);
      });
    }

    // Step 3 — finalize
    await step.run('finalize', async () => {
      await exportRepo.markComplete(exportId);
      await emailService.notifyReady(userId, exportId);
    });
  }
);
```

## Concurrency Control

```typescript
// Prevent concurrent runs of the same job for the same resource
export const processPayment = inngest.createFunction(
  {
    id: 'process-payment',
    concurrency: {
      limit: 1,
      key: 'event.data.subscriptionId', // one at a time per subscription
    },
  },
  { event: 'payment/process' },
  async ({ event, step }) => { ... }
);
```

## Anti-Patterns (Instant Rejection)
- Jobs that are not idempotent (unsafe to retry)
- No retry limit (infinite retry loop)
- No DLQ (silent failures disappear)
- Side effects before durable state update
- Fetching the world in one DB call for fan-out (fetch IDs, process in chunks)
- Cron jobs with no alerting on missed runs
- Long-running logic in HTTP request cycle instead of background job
- No concurrency control on resource-scoped jobs
- Business logic in cron job body (should call service layer)
- Logging job completion without logging job start (no duration visibility)
