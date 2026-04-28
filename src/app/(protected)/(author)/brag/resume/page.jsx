import { getServerAuth } from '@features/auth/server/serverSession.js'
import BragEmployeeScreen from '@features/brag/BragEmployeeScreen'
import { listEntries } from '@features/brag/server/entries.js'

export default async function Page() {
  const auth = await getServerAuth()
  const result = auth.error
    ? { body: { entries: [] }, status: 401 }
    : await listEntries({ userId: auth.userId, searchParams: new URLSearchParams({ limit: '100' }) })

  return (
    <BragEmployeeScreen
      view="resume"
      initialEntries={result.status === 200 ? result.body.entries ?? [] : []}
      initialEntriesError={result.status === 200 ? '' : 'Could not load entries. Please refresh and try again.'}
    />
  )
}
