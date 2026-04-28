'use client'

import { Button } from '@shared/components/ui/Button'

/**
 * App Router error boundary — catches render errors in all non-root segments.
 * `reset` re-renders the segment; if the error is transient this recovers without a reload.
 */
export default function AppError({ error, reset }) {
  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <p className="text-sm font-medium text-ts">Something went wrong.</p>
      <Button
        onClick={reset}
        className="rounded-[var(--r)] bg-acc px-4 py-2 text-sm font-medium text-tp transition-opacity hover:opacity-80"
      >
        Try again
      </Button>
    </div>
  )
}
