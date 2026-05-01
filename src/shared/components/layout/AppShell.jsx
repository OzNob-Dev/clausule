
export function AppShell({ children }) {
  return (
    <div className="app-shell flex min-h-screen w-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--r)] focus:bg-[var(--acc)] focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--tp)]"
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        className="app-main flex min-w-0 flex-1 flex-col bg-[var(--cl-surface-warm)]"
        style={{
          '--canvas': 'var(--cl-surface-warm)',
          '--card': 'var(--cl-surface-paper)',
          '--bg-doc': 'var(--cl-surface-warm)',
          '--bg-comp': 'var(--cl-surface-paper)',
          '--tp': 'var(--cl-surface-ink)',
          '--ts': 'var(--cl-surface-muted)',
          '--tm': 'var(--cl-surface-muted-2)',
          '--tc': 'var(--cl-surface-muted-3)',
          '--tx-1': 'var(--cl-surface-ink)',
          '--tx-2': 'var(--cl-surface-muted)',
          '--tx-3': 'var(--cl-surface-muted-2)',
          '--tx-4': 'var(--cl-surface-muted-3)',
          '--rule': 'var(--cl-rule)',
          '--rule-em': 'var(--cl-rule-6)',
          '--border': 'var(--cl-border)',
          '--border2': 'var(--cl-border-5)',
          '--cb': 'var(--cl-border)',
          '--acc-tint': 'var(--cl-accent-alpha-10)',
          '--acc-bg': 'var(--cl-accent-soft)',
          '--acc-border': 'var(--cl-accent-soft-6)',
          '--acc-text': 'var(--acc)',
          '--blt': 'var(--bl)',
        }}
      >
        {children}
      </main>
    </div>
  )
}
