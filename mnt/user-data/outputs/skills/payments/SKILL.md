---
name: payments
description: >
  Principal guidance for Stripe integration, webhook reliability, idempotency keys,
  subscription lifecycle, failed payment recovery, and payment security. Load when
  building any payment, billing, or subscription feature, reviewing payment flows,
  or handling Stripe webhooks.
---

# Payments — Principal Standards

## Philosophy
- **Payments are the highest-risk surface in the app.** Double-check everything.
- **Stripe is the source of truth for billing state.** Your DB reflects Stripe, it doesn't lead it.
- **Idempotency everywhere.** Duplicate charges destroy trust and require manual remediation.
- **Webhooks are your sync mechanism.** Never poll Stripe. Process events reliably.
- **Test every edge case.** Declined cards, insufficient funds, 3DS challenges, expired cards, subscription gaps.

## Architecture

```
Client             → Stripe Elements (card collection — never your server)
Client             → POST /api/checkout/create-session (your server)
Your server        → Stripe API (create PaymentIntent / CheckoutSession)
Client             → Stripe redirect / confirmation
Stripe             → POST /api/webhooks/stripe (events)
Your webhook       → Update your DB state
Your server        → Read from your DB (never poll Stripe for current state)
```

**Never** collect raw card details. Always Stripe Elements or Stripe-hosted pages.

## Stripe Client Setup

```typescript
// src/shared/utils/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
```

## Idempotency Keys

Every Stripe write operation must include an idempotency key.

```typescript
// Idempotency key: deterministic from the operation context
const idempotencyKey = `create-sub:${userId}:${priceId}:${requestId}`;

const subscription = await stripe.subscriptions.create(
  {
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  },
  { idempotencyKey }
);
```

Key design: `{operation}:{userId}:{resource}:{requestId}` — same operation retried = same Stripe result.

## Checkout Flow

```typescript
// src/app/api/checkout/route.ts
export async function POST(request: NextRequest) {
  const session = await requireAuth();
  const { priceId } = checkoutSchema.parse(await request.json());

  // Get or create Stripe customer
  const user = await userRepo.findById(session.user.id);
  const customerId = await getOrCreateStripeCustomer(user);

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?cancelled=true`,
    subscription_data: {
      metadata: { userId: session.user.id },  // for webhook correlation
    },
    allow_promotion_codes: true,
  }, {
    idempotencyKey: `checkout:${session.user.id}:${priceId}:${Date.now()}`,
  });

  return Response.json({ url: checkoutSession.url });
}

async function getOrCreateStripeCustomer(user: User): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user.id },
  });

  await userRepo.update(user.id, { stripeCustomerId: customer.id });
  return customer.id;
}
```

## Webhook Handler

```typescript
// src/app/api/webhooks/stripe/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (e) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotent processing — record event ID before processing
  const processed = await webhookRepo.findByEventId(event.id);
  if (processed) return Response.json({ ok: true }); // already handled

  await webhookRepo.create({ eventId: event.id, type: event.type, status: 'processing' });

  try {
    await handleStripeEvent(event);
    await webhookRepo.markComplete(event.id);
  } catch (e) {
    await webhookRepo.markFailed(event.id, e.message);
    // Return 500 — Stripe will retry
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }

  return Response.json({ ok: true });
}

async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object as Stripe.CheckoutSession);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    default:
      // Log unhandled events — don't error
      logger.info({ action: 'stripe_event_unhandled', type: event.type });
  }
}
```

## Subscription State Management

```typescript
// Your DB mirrors Stripe — always derived from webhook events
async function handleSubscriptionUpdated(sub: Stripe.Subscription): Promise<void> {
  const userId = sub.metadata.userId;
  if (!userId) throw new Error(`No userId in subscription metadata: ${sub.id}`);

  await subscriptionRepo.upsert({
    userId,
    stripeSubscriptionId: sub.id,
    stripeCustomerId: sub.customer as string,
    status: sub.status,  // active | trialing | past_due | canceled | unpaid
    priceId: sub.items.data[0].price.id,
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  });
}

// Access control: always check subscription status from DB
async function checkSubscriptionAccess(userId: string): Promise<boolean> {
  const sub = await subscriptionRepo.findByUserId(userId);
  return sub?.status === 'active' || sub?.status === 'trialing';
}
```

### Subscription Statuses
```
active          → Paid, full access
trialing        → In trial, full access
past_due        → Payment failed, grace period — limited access
unpaid          → Repeated failures, no access
canceled        → Explicitly canceled — access until period end
incomplete      → Initial payment pending
incomplete_expired → Initial payment timed out
```

## Failed Payment Recovery

```typescript
// On invoice.payment_failed
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const sub = await subscriptionRepo.findByStripeId(invoice.subscription as string);
  if (!sub) return;

  // 1. Update status to past_due
  await subscriptionRepo.update(sub.id, { status: 'past_due' });

  // 2. Send dunning email
  await emailOutbox.insert({
    template: 'payment_failed',
    to: sub.user.email,
    payload: {
      updatePaymentUrl: await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: `${APP_URL}/billing`,
      }).then(s => s.url),
      attemptCount: invoice.attempt_count,
    },
    idempotency_key: `payment-failed:${invoice.id}`,
  });
}
```

## Customer Portal (Self-Service Billing)

```typescript
export async function POST(request: NextRequest) {
  const session = await requireAuth();
  const user = await userRepo.findById(session.user.id);

  if (!user.stripeCustomerId) {
    return Response.json({ error: 'No billing account found' }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return Response.json({ url: portalSession.url });
}
```

Never build your own subscription management UI. Stripe's portal handles: plan changes, cancellation, payment method updates, invoice downloads.

## Security
- Webhook signature verification is **mandatory**. Unsigned webhooks = anyone can fake events.
- Never trust data from the client for payment amounts. Always derive from Stripe.
- Keep `STRIPE_SECRET_KEY` server-only. Never in client bundle.
- `STRIPE_PUBLISHABLE_KEY` is public — safe in `NEXT_PUBLIC_`.
- Never log full webhook payloads (may contain customer PII).
- Test webhooks in dev: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## Testing
```typescript
// Test webhook handler with Stripe test events
it('should activate subscription on checkout.session.completed', async () => {
  const event = buildStripeEvent('checkout.session.completed', {
    metadata: { userId: testUser.id },
    payment_status: 'paid',
  });

  const response = await POST(buildRequest(event));
  expect(response.status).toBe(200);

  const sub = await subscriptionRepo.findByUserId(testUser.id);
  expect(sub?.status).toBe('active');
});
```

## Anti-Patterns (Instant Rejection)
- Collecting card details in your own forms
- No idempotency keys on Stripe API calls
- Polling Stripe for subscription status instead of using webhooks
- Not verifying webhook signatures
- DB subscription state set by client (not webhook)
- No webhook event deduplication
- Accessing Stripe secrets from client-side code
- Reactivating soft-deleted accounts via payment events (requires explicit recovery flow)
- Building custom subscription management instead of using Stripe Portal
- No failed payment email / dunning sequence
