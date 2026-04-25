'use client'

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
          <button
            onClick={reset}
            style={{ padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
