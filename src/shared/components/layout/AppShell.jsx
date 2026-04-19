import { RailNav } from './RailNav'

export function AppShell({ children, rail = <RailNav /> }) {
  return (
    <div className="app-shell">
      {rail}
      <main className="app-main">{children}</main>
    </div>
  )
}
