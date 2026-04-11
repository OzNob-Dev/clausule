import { RailNav } from './RailNav'

export function AppShell({ children }) {
  return (
    <div className="flex w-full min-h-screen">
      <RailNav />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
