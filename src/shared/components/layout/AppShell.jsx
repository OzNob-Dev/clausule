import { RailNav } from './RailNav'

export function AppShell({ children }) {
  return (
    <div className="app-shell">
      <RailNav />
      <main className="app-main">{children}</main>
    </div>
  )
}
