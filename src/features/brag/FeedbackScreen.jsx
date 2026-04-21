'use client'

import { useRouter } from 'next/navigation'
import BragRail from '@features/brag/components/BragRail'
import BragSidebar from '@features/brag/components/BragSidebar'
import FeedbackCenter from '@features/brag/components/FeedbackCenter'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { ROUTES } from '@shared/utils/routes'
import '@features/brag/styles/brag-shell.css'
import '@features/brag/styles/brag-page.css'

function profileDisplayName(profile) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || 'Your profile'
}

export default function FeedbackScreen() {
  const router = useRouter()
  const profile = useProfileStore((state) => state.profile)
  const displayName = profileDisplayName(profile)
  const avatarInitials =
    ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    '?'

  return (
    <div className="be-page">
      <BragRail activePage="feedback" />
      <BragSidebar
        ariaLabel="Feedback guidance"
        eyebrow="Clausule · Feedback"
        avatarInitials={avatarInitials}
        displayName={displayName}
        email={profile.email}
        noteLabel="Why this matters"
        note="Your note goes straight to the Clausule team and stays out of your brag doc."
        overviewLabel="What helps most"
        status="Private"
        statusSub="Seen by the app owners only"
        legendTitle="A useful note usually includes"
        legendItems={[
          { label: 'What happened', color: 'var(--ring-outer)' },
          { label: 'What you expected', color: 'var(--ring-mid)' },
          { label: 'What blocked you', color: 'var(--ring-inner)' },
          { label: 'How urgent it feels', color: 'var(--be-motion-clay)', missing: true },
        ]}
      />

      <main className="be-main" aria-labelledby="feedback-page-title">
        <div className="be-inner">
          <h1 id="feedback-page-title" className="sr-only">Product feedback</h1>
          <FeedbackCenter userEmail={profile.email} onClose={() => router.push(ROUTES.brag)} />
        </div>
      </main>
    </div>
  )
}
