'use client'

import { Button } from '@shared/components/ui/Button'

/**
 * Global error boundary — wraps the root layout.
 * Must include its own <html> and <body> because the root layout is unavailable.
 */
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body>
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
        >
          <p className="text-sm font-medium">Something went wrong.</p>
          <Button
            type="button"
            onClick={reset}
            className="rounded-[var(--r)] border border-border bg-canvas px-4 py-2 text-sm font-semibold text-tp transition-colors duration-150 hover:border-tp"
          >
            Try again
          </Button>
        </div>
      </body>
    </html>
  )
}
