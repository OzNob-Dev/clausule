import { RailNav } from './RailNav'

export function AppShell({ children, rail = <RailNav /> }) {
  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--r)] focus:bg-acc focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-tp"
      >
        Skip to content
      </a>
      {rail}
      <main id="main-content" className="app-main">{children}</main>
    </div>
  )
}
