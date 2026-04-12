import { RailNav } from './RailNav'

export function AppShell({ children }) {
  return (
    <div className="flex w-full min-h-screen">
      <RailNav />
      <main className="app-main flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  )
}
