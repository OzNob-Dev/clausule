---
name: email-notifications
description: >
  Principal guidance for transactional email design, provider integration patterns,
  the outbox pattern for reliable delivery, bounce and complaint handling,
  unsubscribe mechanics, and email template architecture. Load when building
  any email-sending feature, reviewing email reliability, or designing notification systems.
---

# Email & Notifications — Principal Standards

## Philosophy
- **Email is infrastructure, not an afterthought.** Unreliable email = broken auth, missed payments, lost users.
- **Durable before send.** Record the intent to send in DB before calling the email provider.
- **Idempotent sends.** Duplicate emails destroy trust. Deduplicate at every level.
- **Deliverability is a feature.** SPF, DKIM, DMARC, list hygiene, bounce handling = emails actually arriving.

## Provider Stack
```
Transactional email:    Resend (recommended) or Postmark
Marketing/broadcast:    Loops.so or Customer.io
Template rendering:     React Email (components → HTML)
Delivery monitoring:    Provider webhooks → your DB
```

Never: raw SMTP, Nodemailer in production, sending from your own domain without proper DNS records.

## Outbox Pattern (Reliable Delivery)

The core reliability pattern. Write to DB first, send in background.

```typescript
// Step 1: Server action writes email job to outbox table — never calls provider directly
async function registerUser(input: RegisterInput) {
  const user = await userRepo.create(input);

  // Durable write BEFORE side effect — critical
  await db.from('email_outbox').insert({
    to: user.email,
    template: 'welcome',
    payload: { userId: user.id, name: user.name },
    idempotency_key: `welcome:${user.id}`,  // prevent duplicate sends
    status: 'pending',
  });

  return user;
}

// Step 2: Background job processes outbox
export const processEmailOutbox = inngest.createFunction(
  { id: 'process-email-outbox', retries: 3 },
  { cron: '* * * * *' }, // every minute, or trigger on insert
  async ({ step }) => {
    const pending = await db.from('email_outbox')
      .select()
      .eq('status', 'pending')
      .lt('send_after', new Date().toISOString())
      .limit(50);

    for (const job of pending.data ?? []) {
      await step.run(`send-${job.id}`, async () => {
        // Claim job
        await db.from('email_outbox')
          .update({ status: 'processing', claimed_at: new Date() })
          .eq('id', job.id)
          .eq('status', 'pending'); // optimistic lock

        await emailService.send(job);

        await db.from('email_outbox')
          .update({ status: 'sent', sent_at: new Date() })
          .eq('id', job.id);
      });
    }
  }
);
```

## Email Service Layer

```typescript
// src/shared/services/email.service.ts
import { Resend } from 'resend';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

const TEMPLATES = {
  welcome: WelcomeEmail,
  verifyEmail: VerifyEmailEmail,
  passwordReset: PasswordResetEmail,
  invoiceReady: InvoiceReadyEmail,
} as const;

type TemplateName = keyof typeof TEMPLATES;

export class EmailService {
  async send<T extends TemplateName>(
    to: Email,
    template: T,
    props: React.ComponentProps<typeof TEMPLATES[T]>
  ): Promise<void> {
    const Template = TEMPLATES[template];
    const html = await render(<Template {...props as any} />);

    const { error } = await resend.emails.send({
      from: 'Clausule <noreply@clausule.com>',
      to,
      subject: this.getSubject(template, props),
      html,
    });

    if (error) throw new ExternalServiceError('Resend', { cause: error });
  }
}
```

## React Email Templates

```typescript
// src/shared/emails/WelcomeEmail.tsx
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  verifyUrl: string;
}

export function WelcomeEmail({ name, verifyUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Clausule — verify your email to get started</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading>Welcome, {name}</Heading>
          <Text>Thanks for signing up. Please verify your email to continue.</Text>
          <Section>
            <Link href={verifyUrl} style={button}>Verify email</Link>
          </Section>
          <Hr />
          <Text style={footer}>
            If you didn&apos;t create this account, ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Preview in browser during development
WelcomeEmail.PreviewProps = {
  name: 'Alex',
  verifyUrl: 'https://clausule.com/verify?token=preview',
} satisfies WelcomeEmailProps;
```

## Idempotency (Preventing Duplicate Sends)

```sql
-- Email outbox table with idempotency key
CREATE TABLE email_outbox (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  idempotency_key text UNIQUE NOT NULL,  -- prevents duplicate sends
  to_email    text NOT NULL,
  template    text NOT NULL,
  payload     jsonb NOT NULL DEFAULT '{}',
  status      text NOT NULL DEFAULT 'pending',
  send_after  timestamptz NOT NULL DEFAULT now(),
  claimed_at  timestamptz,
  sent_at     timestamptz,
  failed_at   timestamptz,
  error       text,
  attempts    int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_outbox_status_send_after
  ON email_outbox (status, send_after)
  WHERE status = 'pending';
```

Idempotency key format: `{template}:{entityId}` — `welcome:{userId}`, `invoice:{invoiceId}`, `reset:{tokenId}`.

## Bounce and Complaint Handling

```typescript
// src/app/api/webhooks/resend/route.ts
export async function POST(request: NextRequest) {
  // Verify webhook signature
  const signature = request.headers.get('svix-signature');
  const payload = await request.text();
  if (!verifyResendWebhook(payload, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(payload);

  switch (event.type) {
    case 'email.bounced':
      // Hard bounce: mark email address as undeliverable
      await emailStatusRepo.markBounced(event.data.to, 'hard', event.data.bounce_type);
      break;

    case 'email.complained':
      // Spam complaint: immediately unsubscribe
      await emailStatusRepo.markComplained(event.data.to);
      await unsubscribeRepo.upsert({ email: event.data.to, reason: 'spam_complaint' });
      break;

    case 'email.delivery_delayed':
      // Log for monitoring, no action needed
      logger.warn({ action: 'email_delayed', to: event.data.to });
      break;
  }

  return Response.json({ ok: true });
}
```

### Suppression List
```typescript
// Before every send: check suppression list
async function canSendTo(email: Email): Promise<boolean> {
  const suppressed = await db.from('email_suppressions')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  return suppressed.data === null;
}
```

Never send to: bounced addresses, complainers, unsubscribed users. Sending to suppressed addresses damages deliverability for all users.

## Unsubscribe

```typescript
// Every marketing/notification email must have one-click unsubscribe
// RFC 8058 compliant: List-Unsubscribe header + POST endpoint

// In email headers (set via provider)
'List-Unsubscribe': `<https://app.com/unsubscribe?token=${unsubToken}>`,
'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',

// Unsubscribe endpoint
export async function POST(request: NextRequest) {
  const { token } = await request.json();
  const sub = await unsubscribeTokenRepo.verify(token);
  if (!sub) return Response.json({ error: 'Invalid token' }, { status: 400 });

  await unsubscribeRepo.upsert({ userId: sub.userId, category: sub.category });
  await unsubscribeTokenRepo.consume(token);

  return Response.json({ ok: true });
}
```

## Notification Categories

Always give users control by category. Never one global unsub for transactional emails.

```typescript
type NotificationCategory =
  | 'transactional'    // Never unsubscribable (receipts, security alerts, account actions)
  | 'product_updates'  // New features, changelog
  | 'tips_and_guides'  // Onboarding tips, how-tos
  | 'marketing'        // Promotions, announcements
  | 'digest'           // Weekly/daily digest emails
```

Transactional = mandatory. All others = opt-out.

## Anti-Patterns (Instant Rejection)
- Calling email provider synchronously in a request handler
- No idempotency key (duplicate emails on retry)
- Sending to bounced or complained addresses
- No unsubscribe mechanism on non-transactional emails
- Storing email content in DB instead of rendering at send time
- No webhook handling for bounces/complaints
- Hardcoded from addresses or subjects
- HTML email written in raw HTML strings (unmaintainable, error-prone)
- No preview/test mode for email templates
- Logging email content (may contain PII, tokens)
