import { getServerAuth } from '@auth/server/serverSession.js'
import ResumeScreen from '@resume/ResumeScreen'
import { listEntries } from '@brag/server/entries.js'

export default async function Page() {
  const auth = await getServerAuth()
  const result = auth.error
    ? { body: { entries: [] }, status: 401 }
    : await listEntries({ userId: auth.userId, searchParams: new URLSearchParams({ limit: '100' }) })

  return (
    <ResumeScreen
      initialEntries={result.status === 200 ? result.body.entries ?? [] : []}
      initialEntriesError={result.status === 200 ? '' : 'Could not load entries. Please refresh and try again.'}
    />
  )
}
