'use client'

import { useRouter } from 'next/navigation'
import FeedbackCenter from '@features/brag/components/FeedbackCenter'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { ROUTES } from '@shared/utils/routes'
import '@features/brag/styles/brag-page.css'

export default function FeedbackScreen() {
  const router = useRouter()
  const profile = useProfileStore((state) => state.profile)

  return (
    <main className="be-main" aria-labelledby="feedback-page-title">
      <div className="be-inner">
        <h1 id="feedback-page-title" className="sr-only">Product feedback</h1>
        <FeedbackCenter userEmail={profile.email} onClose={() => router.push(ROUTES.brag)} />
      </div>
    </main>
  )
}
