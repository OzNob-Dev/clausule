import { getServerAuth } from '@auth/server/serverSession.js'
import LinkedInImportScreen from '@brag/LinkedInImportScreen'
import { getLatestLinkedInImport } from '@brag/server/linkedinImports.js'

export default async function Page() {
  const auth = await getServerAuth()
  const result = auth.error
    ? { body: { session: null }, status: 401 }
    : await getLatestLinkedInImport({ userId: auth.userId })

  return (
    <LinkedInImportScreen
      initialSession={result.status === 200 ? result.body.session ?? null : null}
      initialError={result.status === 200 ? '' : 'Could not load LinkedIn import. Please refresh and try again.'}
    />
  )
}
