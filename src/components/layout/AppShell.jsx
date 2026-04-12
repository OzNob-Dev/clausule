import { RailNav } from './RailNav'

export function AppShell({ children }) {
  return (
    <div className="flex w-full" style={{ height: '100vh', overflow: 'hidden' }}>
      <RailNav />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">{children}</main>
    </div>
  )
}
