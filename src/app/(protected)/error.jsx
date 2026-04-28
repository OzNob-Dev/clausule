'use client'

import { Button } from '@shared/components/ui/Button'

/**
 * Error boundary for all protected routes.
 * Gives authenticated users a recovery path without losing their session.
 */
export default function ProtectedError({ error, reset }) {
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
