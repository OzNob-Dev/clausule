---
name: realtime
description: >
  Principal guidance for real-time features using WebSockets, Server-Sent Events (SSE),
  Supabase Realtime, presence systems, broadcast patterns, and connection lifecycle
  management. Load when building live updates, collaborative features, notifications,
  presence indicators, or any feature requiring server-pushed data.
---

# Realtime — Principal Standards

## Technology Selection
```
Use Case                            Technology
─────────────────────────────────────────────────────────────────
DB row changes → client             Supabase Realtime (Postgres CDC)
Server → client one-way stream      SSE (Server-Sent Events)
Bidirectional / low-latency         WebSocket (Supabase or Ably/Pusher)
Presence (who is online)            Supabase Realtime presence
Broadcast (fire-and-forget events)  Supabase Realtime broadcast
Live notifications                  SSE or Supabase Realtime
Collaborative editing               WebSocket + operational transform / CRDT
```

SSE > WebSocket when communication is one-way. Simpler, works over HTTP/2, auto-reconnect built-in.

## Supabase Realtime

### Postgres CDC (Row Changes)
```typescript
// src/features/posts/hooks/usePostUpdates.ts
import { useEffect } from 'react';
import { createClient } from '@/shared/utils/supabase/client';

export function usePostUpdates(
  postId: string,
  onUpdate: (post: Post) => void
) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`post:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`,
        },
        (payload) => {
          onUpdate(mapToPost(payload.new));
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          logger.error({ action: 'realtime_channel_error', postId });
        }
      });

    // CRITICAL: always unsubscribe in cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, onUpdate]);
}
```

### Rules for CDC
- Filter at the channel level (`filter: 'id=eq.X'`), not in the callback. Reduces unnecessary traffic.
- Only subscribe to tables with RLS enabled — broadcasts respect RLS.
- Never subscribe to tables with sensitive data without explicit RLS policies for the subscribed rows.
- One channel per resource instance. Don't create N channels for N rows — filter on one channel.
- Handle `CHANNEL_ERROR` and `TIMED_OUT` status — reconnect or degrade gracefully.

### Presence (Who Is Online)
```typescript
export function usePresence(roomId: string, userId: string) {
  const [presentUsers, setPresentUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`room:${roomId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>();
        setPresentUsers(Object.values(state).flat());
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Handled by sync, but can add join notification here
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [roomId, userId]);

  return presentUsers;
}
```

### Broadcast (Event Distribution)
```typescript
// Send
const channel = supabase.channel('room:123');
await channel.send({
  type: 'broadcast',
  event: 'cursor_moved',
  payload: { userId, x: 42, y: 108 },
});

// Receive
channel.on('broadcast', { event: 'cursor_moved' }, (payload) => {
  updateCursor(payload.userId, payload.x, payload.y);
});
```

Broadcast is ephemeral — not stored, not replayed for late joiners. Use for high-frequency, loss-tolerant events (cursor position, typing indicators). Not for state that must be persisted.

## Server-Sent Events (SSE)

For server → client push without bidirectional needs:

```typescript
// src/app/api/notifications/stream/route.ts
export async function GET(request: NextRequest) {
  const session = await requireAuth();

  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'));

      // Poll for new notifications
      intervalId = setInterval(async () => {
        const notifications = await notificationRepo.findUnread(session.user.id);
        if (notifications.length > 0) {
          const data = JSON.stringify(notifications);
          controller.enqueue(encoder.encode(`event: notifications\ndata: ${data}\n\n`));
        }
      }, 3000);
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // disable Nginx buffering
    },
  });
}
```

```typescript
// Client hook
export function useSSENotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.addEventListener('notifications', (e) => {
      setNotifications(JSON.parse(e.data));
    });

    eventSource.onerror = () => {
      // EventSource auto-reconnects after error — no manual retry needed
      logger.warn({ action: 'sse_error' });
    };

    return () => eventSource.close();
  }, []);

  return notifications;
}
```

## Connection Lifecycle

### Rules
- **Always clean up subscriptions.** Memory leak + server resource exhaustion if not.
- **Handle errors explicitly.** Log channel errors. Degrade gracefully (show stale data, not broken UI).
- **Reconnection is built-in** for SSE and Supabase Realtime. Don't implement manual reconnect unless there's a specific reason.
- **Authentication before subscription.** Never subscribe to channels before auth is confirmed.
- **Unsubscribe on auth change.** Log out = tear down all realtime connections.

### Cleanup Pattern
```typescript
// Single channel
return () => { supabase.removeChannel(channel); };

// Multiple channels
const channels: RealtimeChannel[] = [];
// ... add channels
return () => {
  channels.forEach(ch => supabase.removeChannel(ch));
};

// All channels (e.g., on logout)
await supabase.removeAllChannels();
```

## Security
- RLS policies apply to realtime CDC subscriptions — rows the user can't SELECT, they can't receive via realtime.
- Never broadcast sensitive data via broadcast (not protected by RLS).
- Auth token included in realtime connection automatically via Supabase client — don't pass credentials manually.
- Rate limit broadcast sends — clients can abuse if no limit.

## Performance
- Don't subscribe to entire tables without a filter. Always filter: `filter: 'user_id=eq.X'`.
- Batch rapid updates — debounce UI updates from high-frequency events (cursor moves).
- Presence payload should be minimal (userId + status, not full profile).
- SSE polling interval: 3-5s minimum. Sub-second polling = use WebSocket instead.

## Anti-Patterns (Instant Rejection)
- Not cleaning up channels/subscriptions on unmount
- Subscribing to unfiltered tables (entire table broadcasts to all subscribers)
- Using broadcast for data that must be persisted (it's ephemeral)
- Creating a new channel on every render (must be in useEffect with stable deps)
- Subscribing before auth is confirmed
- Not handling channel error status
- Re-implementing reconnect logic when the client already handles it
- Passing full user objects as presence payload
