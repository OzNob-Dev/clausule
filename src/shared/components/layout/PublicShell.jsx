export default function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,var(--cl-accent-soft-4),transparent_28%),linear-gradient(180deg,var(--cl-surface-paper-2)_0%,var(--cl-surface-warm)_100%)] text-tp">
      {children}
    </div>
  )
}
