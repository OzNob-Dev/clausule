'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@shared/components/ui/Button'
import { FieldCheckbox } from '@shared/components/ui/Field'
import { ROUTES } from '@shared/utils/routes'
import Layout from '@brag/components/layout'
import { createLinkedInImportAction, publishLinkedInImportAction, updateLinkedInImportAction } from '@actions/brag-actions'
import '@brag/styles/linkedin-import.css'

const IMPORT_STEPS = [
  { id: 1, label: 'Connect' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Publish' },
]

const KIND_LABELS = {
  experience: 'Work history',
  achievement: 'Achievement',
  recommendation: 'Recommendation',
  skill: 'Skill',
}

const EVIDENCE_LABELS = {
  'Work artefact': 'Work artefact',
  'Metrics / data': 'Metrics',
  'Peer recognition': 'Recognition',
  'External link': 'External link',
}

function stepIndex(session) {
  if (!session) return 1
  if (session.status === 'published') return 3
  return 2
}

function LinkedInMark() {
  return (
    <span className="li-mark" aria-hidden="true">
      <span className="li-mark__in">in</span>
    </span>
  )
}

function ImportCard({ item, onToggle, disabled, updating }) {
  return (
    <label className="li-item-card">
      <span className="li-item-card__check">
        <FieldCheckbox
          checked={item.selected}
          onChange={() => onToggle(item)}
          disabled={disabled}
        />
      </span>
      <span className="li-item-card__body">
        <span className="li-item-card__meta">
          <span className="li-item-kind">{KIND_LABELS[item.kind] ?? 'Imported item'}</span>
          <span className="li-item-evidence">{EVIDENCE_LABELS[item.evidence_type] ?? item.evidence_type}</span>
          {updating ? <span className="li-item-state">Saving…</span> : null}
        </span>
        <strong className="li-item-title">{item.title}</strong>
        <span className="li-item-copy">{[item.organization, item.body].filter(Boolean).join(' · ')}</span>
      </span>
    </label>
  )
}

function stepClass(current, step) {
  return current >= step ? 'li-step li-step--active' : 'li-step'
}

export default function LinkedInImportScreen({ initialSession = null, initialError = '' }) {
  const router = useRouter()
  const [session, setSession] = useState(initialSession)
  const [error, setError] = useState(initialError)
  const [localItems, setLocalItems] = useState(initialSession?.linkedin_import_items ?? [])
  const [updatingItemId, setUpdatingItemId] = useState('')
  const [publishedEntries, setPublishedEntries] = useState([])

  useEffect(() => {
    setSession(initialSession)
    setError(initialError)
    setLocalItems(initialSession?.linkedin_import_items ?? [])
    setPublishedEntries([])
  }, [initialError, initialSession])

  const connectMutation = useMutation({
    mutationFn: () => createLinkedInImportAction(),
  })

  const publishMutation = useMutation({
    mutationFn: (sessionId) => publishLinkedInImportAction(sessionId),
  })

  const activeStep = stepIndex(session)
  const importItems = useMemo(() => localItems.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)), [localItems])
  const selectedCount = importItems.filter((item) => item.selected).length
  const actionLabel = 'Continue'
  const isBusy = connectMutation.isPending || publishMutation.isPending

  const syncSession = (next) => {
    setSession(next)
    setLocalItems(next?.linkedin_import_items ?? [])
    setPublishedEntries([])
  }

  const handleConnect = async () => {
    setError('')
    try {
      const result = await connectMutation.mutateAsync()
      syncSession(result.session)
    } catch {
      setError('Could not connect your LinkedIn profile. Please try again.')
    }
  }

  const handleToggle = async (item) => {
    if (!session) return
    const nextSelected = !item.selected
    setUpdatingItemId(item.id)
    setLocalItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, selected: nextSelected } : entry)))

    try {
      const result = await updateLinkedInImportAction(session.id, { itemId: item.id, selected: nextSelected })
      syncSession(result.session)
    } catch {
      setError('Could not update that selection. Please try again.')
      setLocalItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, selected: item.selected } : entry)))
    } finally {
      setUpdatingItemId('')
    }
  }

  const handleSkip = async () => {
    if (session?.id) {
      try {
        await updateLinkedInImportAction(session.id, { status: 'skipped' })
      } catch {
        // Skip should still let the user leave the page.
      }
    }
    router.push(ROUTES.brag)
  }

  const handlePublish = async () => {
    if (!session?.id) {
      await handleConnect()
      return
    }

    setError('')
    try {
      const result = await publishMutation.mutateAsync(session.id)
      syncSession(result.session)
      setPublishedEntries(result.entries ?? [])
    } catch {
      setError('Could not publish these imports. Please try again.')
    }
  }

  return (
    <Layout mainClassName="li-page page-enter" innerClassName="li-shell" ariaLabelledby="linkedin-import-title">
      <header className="li-header">
        <span className="li-eyebrow">Brag Doc Builder</span>
        <h1 id="linkedin-import-title">Import from LinkedIn</h1>
        <p>Connect your LinkedIn profile to import work history, achievements, and recommendations into your brag doc.</p>
      </header>

      <div className="li-divider" aria-hidden="true" />

      <section className="li-card" aria-labelledby="linkedin-import-step-title">
        <div className="li-steps" aria-label="Import progress">
          {IMPORT_STEPS.map((step) => (
            <span key={step.id} className={stepClass(activeStep, step.id)} aria-label={step.label} />
          ))}
        </div>

        {session?.status === 'published' ? (
          <div className="li-success" role="status" aria-live="polite">
            <div className="li-success__mark" aria-hidden="true">
              <LinkedInMark />
            </div>
            <div>
              <p className="li-step-label">Imported</p>
              <h2 className="li-step-title">LinkedIn import published to your brag doc</h2>
              <p className="li-step-copy">
                {publishedEntries.length ? `${publishedEntries.length} draft${publishedEntries.length === 1 ? '' : 's'} were saved.` : 'Your selected drafts are ready in the brag doc.'}
              </p>
            </div>
            <div className="li-success__actions">
              <Button type="button" variant="ghost" className="li-btn li-btn--secondary" onClick={() => router.push(ROUTES.bragResume)}>Open resume</Button>
              <Button type="button" variant="primary" className="li-btn li-btn--primary" onClick={() => router.push(ROUTES.brag)}>Back to brag doc</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="li-stage">
              <div className="li-stage__copy">
                <p className="li-step-label">Step {activeStep} of 3</p>
                <h2 id="linkedin-import-step-title" className="li-step-title">
                  {session ? 'Review imported drafts' : 'Connect your LinkedIn profile'}
                </h2>
                <p className="li-step-copy">
                  {session
                    ? 'Pick the drafts you want to save, then publish them into your brag doc.'
                    : 'We only import the details you choose. LinkedIn stays a source, not a destination.'}
                </p>
              </div>

              <div className="li-connect-card">
                <div className="li-connect-card__icon" aria-hidden="true">
                  <LinkedInMark />
                </div>
                <div>
                  <h3>Authorize LinkedIn access</h3>
                  <p>Connect to LinkedIn to seed a private preview of your work history and social proof.</p>
                </div>
                <Button type="button" variant="primary" className="li-btn li-btn--linkedin" onClick={handleConnect} disabled={connectMutation.isPending || publishMutation.isPending || Boolean(session)}>
                  <LinkedInMark />
                  {session ? 'Connected' : 'Connect with LinkedIn'}
                </Button>
              </div>

              <div className="li-info">
                <h3>What we import from your profile</h3>
                <ul className="li-info__list">
                  <li>Work experience, job titles, and employment dates</li>
                  <li>Project descriptions and achievements</li>
                  <li>Recommendations and endorsements</li>
                  <li>Skills and certifications</li>
                </ul>
              </div>
            </div>

            {session ? (
              <section className="li-review" aria-labelledby="linkedin-import-review-title">
                <div className="li-review__head">
                  <div>
                    <p className="li-step-label">Imported preview</p>
                    <h3 id="linkedin-import-review-title">{session.profile_name}</h3>
                    <p>{session.headline || 'Professional snapshot'}</p>
                  </div>
                  <span className="li-review__count">{selectedCount} selected</span>
                </div>

                <div className="li-review__items" role="list" aria-label="Imported LinkedIn drafts">
                  {importItems.map((item) => (
                    <ImportCard key={item.id} item={item} onToggle={handleToggle} disabled={isBusy} updating={updatingItemId === item.id} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}

        <div className="li-actions">
          <Button type="button" variant="ghost" className="li-btn li-btn--secondary" onClick={handleSkip} disabled={isBusy}>Skip for now</Button>
          <Button type="button" variant="primary" className="li-btn li-btn--primary" onClick={session ? handlePublish : handleConnect} disabled={isBusy || (!session && connectMutation.isPending)}>
            {session ? 'Publish to brag doc' : actionLabel}
          </Button>
        </div>

        {error ? <p className="li-error" role="alert">{error}</p> : null}
      </section>
    </Layout>
  )
}
