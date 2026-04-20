'use client'

import { useRouter } from 'next/navigation'
import BragRail from '@features/brag/components/BragRail'
import FeedbackComposer from '@features/brag/components/FeedbackComposer'
import { ROUTES } from '@shared/utils/routes'
import '@features/brag/styles/brag-shell.css'
import '@features/brag/styles/brag-page.css'

export default function FeedbackScreen() {
  const router = useRouter()

  return (
    <div className="be-page">
      <BragRail activePage="feedback" />

      <main className="be-main" aria-labelledby="feedback-page-title">
        <div className="be-inner">
          <h1 id="feedback-page-title" className="sr-only">Product feedback</h1>
          <FeedbackComposer onClose={() => router.push(ROUTES.brag)} />
        </div>
      </main>
    </div>
  )
}
