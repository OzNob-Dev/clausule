---
name: optimistic-ui
description: >
  Principal guidance for optimistic UI patterns: React Query optimistic updates, conflict
  resolution, rollback UX, skeleton-to-real transitions, and deciding when optimistic
  updates are appropriate vs dangerous. Load when implementing mutations that need
  immediate feedback, reviewing optimistic update correctness, or designing
  perceived-performance improvements for common user actions.
---

# Optimistic UI — Principal Standards

## When to Use Optimistic Updates

```
USE OPTIMISTIC UPDATE:
  ✓ Action is nearly always successful (>99% success rate)
  ✓ Rollback is trivially reversible and non-destructive
  ✓ User expects immediate feedback (like, save, toggle, reorder)
  ✓ Latency would otherwise feel broken (>300ms operations)
  ✓ Failure is low-stakes (e.g., liking a post vs. billing)

DO NOT USE OPTIMISTIC UPDATE:
  ✗ Payment or financial transactions
  ✗ Irreversible actions (hard delete, account closure)
  ✗ Actions with complex server-side side effects (triggers, webhooks)
  ✗ Actions requiring server-generated data in the UI (new ID, computed fields)
  ✗ Actions with meaningful conflict potential (concurrent edits)
  ✗ Any action where showing wrong state causes confusion or trust loss
```

## React Query Optimistic Pattern

```typescript
// Canonical optimistic update with React Query
function useToggleLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liked: boolean) => togglePostLike(postId, liked),

    onMutate: async (newLiked: boolean) => {
      // 1. Cancel in-flight refetches (prevent overwriting optimistic state)
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      // 2. Snapshot current state for rollback
      const previousPost = queryClient.getQueryData<Post>(['post', postId]);

      // 3. Apply optimistic update
      queryClient.setQueryData<Post>(['post', postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          liked: newLiked,
          likeCount: newLiked ? old.likeCount + 1 : old.likeCount - 1,
        };
      });

      // 4. Return snapshot for onError
      return { previousPost };
    },

    onError: (err, newLiked, context) => {
      // 5. Roll back on failure
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      // Show user-friendly error
      toast.error('Could not save — please try again');
    },

    onSettled: () => {
      // 6. Always refetch to sync with server truth
      // Even on success — server may have applied different state
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}
```

## List Optimistic Updates

More complex — adding/removing items from a collection:

```typescript
function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => createComment(postId, content),

    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      const previousComments = queryClient.getQueryData<Comment[]>(['comments', postId]);

      // Generate a temporary ID for the optimistic item
      const tempId = `temp-${Date.now()}`;

      queryClient.setQueryData<Comment[]>(['comments', postId], (old = []) => [
        ...old,
        {
          id: tempId,
          content,
          postId,
          userId: currentUser.id,
          author: currentUser,
          createdAt: new Date().toISOString(),
          isOptimistic: true, // flag for UI styling
        },
      ]);

      return { previousComments, tempId };
    },

    onError: (err, content, context) => {
      queryClient.setQueryData(['comments', postId], context?.previousComments);
      toast.error('Comment failed to post');
    },

    onSuccess: (newComment, content, context) => {
      // Replace temp item with real server response (has real ID)
      queryClient.setQueryData<Comment[]>(['comments', postId], (old = []) =>
        old.map(c => c.id === context?.tempId ? newComment : c)
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
}
```

## Optimistic Delete

```typescript
function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),

    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData<Post[]>(['posts']);

      // Remove from list immediately
      queryClient.setQueryData<Post[]>(['posts'], (old = []) =>
        old.filter(p => p.id !== postId)
      );

      return { previousPosts };
    },

    onError: (err, postId, context) => {
      // Restore deleted item
      queryClient.setQueryData(['posts'], context?.previousPosts);
      toast.error('Could not delete post');
    },

    // No onSuccess needed — item already removed
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
```

## Rollback UX

Rollback should be invisible when handled correctly. But when visible:

```typescript
// Pattern: show toast with undo option
function useDeleteWithUndo() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: deletePost,
    onMutate: async (postId) => {
      // Optimistic remove
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(['posts'], context?.previousPosts);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  return (postId: string, postTitle: string) => {
    mutate(postId);

    // Show undo toast
    toast(
      `"${postTitle}" deleted`,
      {
        action: {
          label: 'Undo',
          onClick: () => {
            // Abort or reverse the delete if within window
            // If server delete completed, this needs a restore API
          },
        },
        duration: 5000,
      }
    );
  };
}
```

## Optimistic Item States

Show distinct visual states for items mid-mutation:

```typescript
// CSS for optimistic items — slightly dimmed to indicate pending
.comment--optimistic {
  opacity: 0.7;
  pointer-events: none; // prevent interaction while pending
}

// In component
<Comment
  key={comment.id}
  comment={comment}
  className={cn(comment.isOptimistic && 'comment--optimistic')}
/>
```

## Skeleton-to-Real Transitions

Avoid layout shift when data loads:

```typescript
// Reserve space with skeleton that matches real content dimensions
function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      {/* Reserve 1 line height for like count — prevents shift */}
      <span className="like-count">{post.likeCount} likes</span>
    </article>
  );
}

function PostCardSkeleton() {
  return (
    <article className="post-card" aria-busy="true" aria-label="Loading post">
      <div className="skeleton h-6 w-3/4 mb-2" />  {/* matches h2 */}
      <div className="skeleton h-4 w-full mb-1" />  {/* matches excerpt line 1 */}
      <div className="skeleton h-4 w-2/3 mb-4" />  {/* matches excerpt line 2 */}
      <div className="skeleton h-4 w-16" />          {/* matches like count */}
    </article>
  );
}
// Key: skeleton dimensions match real content dimensions exactly
// Prevents CLS when content loads
```

## Conflict Resolution

When optimistic state conflicts with server response:

```typescript
// Strategy 1: Server wins (simplest — good for most cases)
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['post', postId] });
  // Server state overwrites optimistic state on refetch
}

// Strategy 2: Show conflict warning (for concurrent editing)
onSuccess: (serverData, variables, context) => {
  const optimisticData = queryClient.getQueryData(['document', docId]);
  if (hasConflict(optimisticData, serverData)) {
    showConflictResolution(optimisticData, serverData);
  } else {
    queryClient.setQueryData(['document', docId], serverData);
  }
}

// Strategy 3: Last-write-wins with version check
type DocumentUpdate = {
  content: string;
  version: number; // include current version in mutation
};
// Server rejects if version doesn't match → show "stale data" message
```

## Debounced Optimistic Updates (Auto-save)

```typescript
// Auto-save with optimistic update — don't fire on every keystroke
function useAutoSave(documentId: string) {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (content: string) => saveDocument(documentId, content),
    onMutate: async (content) => {
      // Optimistic: update local state immediately
      queryClient.setQueryData(['document', documentId], (old: Doc) => ({
        ...old, content, savedAt: null, isSaving: true,
      }));
    },
    onSuccess: () => {
      queryClient.setQueryData(['document', documentId], (old: Doc) => ({
        ...old, savedAt: new Date(), isSaving: false,
      }));
    },
  });

  // Debounce: only save after 1s of no typing
  const debouncedMutate = useMemo(
    () => debounce(mutate, 1000),
    [mutate]
  );

  return debouncedMutate;
}
```

## Anti-Patterns (Instant Rejection)
- Optimistic updates on payments or irreversible actions
- No rollback handler (`onError` missing or empty)
- Optimistic state never synced with server (`onSettled` without `invalidateQueries`)
- Showing optimistic item with same visual treatment as confirmed items (user can't tell what's pending)
- Generating fake IDs that collide with real IDs after server response
- Not cancelling in-flight queries before applying optimistic state (leads to race conditions)
- Optimistic delete without a toast/undo window for accidental deletes
- Multiple overlapping mutations on the same resource without sequencing
