'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@shared/components/ui/Button'
import { FieldCheckbox } from '@shared/components/ui/Field'
import { ROUTES } from '@shared/utils/routes'
import { createLinkedInImportAction, publishLinkedInImportAction, updateLinkedInImportAction } from '@actions/brag-actions'

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
    <span className="li-mark inline-grid h-10 w-10 place-items-center rounded-2xl bg-[var(--cl-surface-white)] text-[var(--cl-text-xl)] font-extrabold lowercase text-[var(--cl-linkedin)]" aria-hidden="true">
      <span className="li-mark__in -translate-y-px">in</span>
    </span>
  )
}

function ImportCard({ item, onToggle, disabled, updating }) {
  return (
    <label className="li-item-card grid gap-3 rounded-2xl border border-[var(--cl-border-2)] bg-[var(--cl-surface-white)] p-4 shadow-[0_10px_24px_rgba(26,18,12,0.04)]">
      <span className="li-item-card__check">
        <FieldCheckbox
          checked={item.selected}
          onChange={() => onToggle(item)}
          disabled={disabled}
        />
      </span>
      <span className="li-item-card__body min-w-0">
        <span className="li-item-card__meta mb-2 flex flex-wrap gap-2 text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.12em] text-[var(--cl-surface-muted-8)]">
          <span className="li-item-kind">{KIND_LABELS[item.kind] ?? 'Imported item'}</span>
          <span className="li-item-evidence">{EVIDENCE_LABELS[item.evidence_type] ?? item.evidence_type}</span>
          {updating ? <span className="li-item-state text-[var(--cl-accent-deep)]">Saving…</span> : null}
        </span>
        <strong className="li-item-title block text-[var(--cl-text-base)] font-bold text-[var(--cl-surface-ink-2)]">{item.title}</strong>
        <span className="li-item-copy mt-1 block text-[var(--cl-text-sm)] leading-[1.6] text-[var(--cl-brown-alpha-76)]">{[item.organization, item.body].filter(Boolean).join(' · ')}</span>
      </span>
    </label>
  )
}

function stepClass(current, step) {
  return current >= step
    ? 'li-step li-step--active h-2 rounded-full bg-[linear-gradient(90deg,var(--cl-accent-deep)_0%,var(--cl-accent-deeper)_100%)] shadow-[0_0_0_1px_var(--cl-accent-soft-15)]'
    : 'li-step h-2 rounded-full bg-[var(--cl-muted-12)]'
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
    <>
      <header className="li-header mb-8 max-w-[760px]">
        <span className="li-eyebrow inline-flex items-center text-[var(--cl-text-sm)] font-bold uppercase tracking-[0.08em] text-[var(--cl-accent-deep)]">Brag Doc Builder</span>
        <h1 id="linkedin-import-title" className="mt-3 [font-family:var(--cl-font-serif)] text-[clamp(2.5rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em]">Import from LinkedIn</h1>
        <p className="mt-3 text-[var(--cl-text-xl)] leading-[1.65] text-[var(--cl-brown-alpha-76)]">Connect your LinkedIn profile to import work history, achievements, and recommendations into your brag doc.</p>
      </header>

      <div className="li-divider mb-8 h-0.5 bg-[linear-gradient(90deg,var(--cl-accent-deep)_0%,transparent_100%)]" aria-hidden="true" />

      <section className="li-card rounded-[20px] border border-[var(--cl-border-2)] bg-[var(--cl-white-72)] p-10 shadow-[var(--cl-shadow-soft),var(--cl-shadow-med)] backdrop-blur-[20px]" aria-labelledby="linkedin-import-step-title">
        <div className="li-steps mb-7 grid grid-cols-3 gap-3" aria-label="Import progress">
          {IMPORT_STEPS.map((step) => (
            <span key={step.id} className={stepClass(activeStep, step.id)} aria-label={step.label} />
          ))}
        </div>

        {session?.status === 'published' ? (
          <div className="li-success grid gap-5" role="status" aria-live="polite">
            <div className="li-success__mark inline-grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--cl-linkedin)_0%,var(--cl-linkedin-2)_100%)] shadow-[var(--cl-shadow-linkedin-2)]" aria-hidden="true">
              <LinkedInMark />
            </div>
            <div>
              <p className="li-step-label inline-flex items-center text-[var(--cl-text-sm)] font-bold uppercase tracking-[0.08em] text-[var(--cl-accent-deep)]">Imported</p>
              <h2 className="li-step-title mt-2 [font-family:var(--cl-font-serif)] text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.08] tracking-[-0.02em]">LinkedIn import published to your brag doc</h2>
              <p className="li-step-copy mt-3 max-w-[62ch] text-[var(--cl-text-xl)] leading-[1.65] text-[var(--cl-brown-alpha-76)]">
                {publishedEntries.length ? `${publishedEntries.length} draft${publishedEntries.length === 1 ? '' : 's'} were saved.` : 'Your selected drafts are ready in the brag doc.'}
              </p>
            </div>
            <div className="li-success__actions flex flex-wrap gap-3">
              <Button type="button" variant="ghost" className="li-btn li-btn--secondary min-h-12 rounded-xl border-2 border-[var(--cl-muted-12)] bg-[var(--cl-dialog-surface)] px-[18px] text-[var(--cl-text-xl)] font-bold text-[var(--cl-brown)] shadow-none" onClick={() => router.push(ROUTES.bragResume)}>Open resume</Button>
              <Button type="button" variant="primary" className="li-btn li-btn--primary min-h-12 rounded-xl bg-[linear-gradient(135deg,var(--cl-accent-deep)_0%,var(--cl-accent-deeper)_100%)] px-[18px] text-[var(--cl-text-xl)] font-bold text-[var(--cl-surface-white)] shadow-[0_8px_24px_var(--cl-accent-soft-21)]" onClick={() => router.push(ROUTES.brag)}>Back to brag doc</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="li-stage mb-6 grid gap-5">
              <div className="li-stage__copy max-w-[760px]">
                <p className="li-step-label inline-flex items-center text-[var(--cl-text-sm)] font-bold uppercase tracking-[0.08em] text-[var(--cl-accent-deep)]">Step {activeStep} of 3</p>
                <h2 id="linkedin-import-step-title" className="li-step-title mt-2 [font-family:var(--cl-font-serif)] text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.08] tracking-[-0.02em]">
                  {session ? 'Review imported drafts' : 'Connect your LinkedIn profile'}
                </h2>
                <p className="li-step-copy mt-3 max-w-[62ch] text-[var(--cl-text-xl)] leading-[1.65] text-[var(--cl-brown-alpha-76)]">
                  {session
                    ? 'Pick the drafts you want to save, then publish them into your brag doc.'
                    : 'We only import the details you choose. LinkedIn stays a source, not a destination.'}
                </p>
              </div>

              <div className="li-connect-card grid items-center gap-[18px] rounded-2xl border-2 border-[var(--cl-muted-12)] bg-[var(--cl-surface-white)] p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-[var(--cl-linkedin)] hover:shadow-[var(--cl-shadow-med)] min-[900px]:grid-cols-[auto_1fr_auto]">
                <div className="li-connect-card__icon inline-grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--cl-linkedin)_0%,var(--cl-linkedin-2)_100%)] shadow-[var(--cl-shadow-linkedin-2)]" aria-hidden="true">
                  <LinkedInMark />
                </div>
                <div>
                  <h3 className="[font-family:var(--cl-font-serif)] text-[var(--cl-text-2xl)] tracking-[-0.02em]">Authorize LinkedIn access</h3>
                  <p className="mt-2 text-[var(--cl-text-xl)] leading-[1.65] text-[var(--cl-brown-alpha-76)]">Connect to LinkedIn to seed a private preview of your work history and social proof.</p>
                </div>
                <Button type="button" variant="primary" className="li-btn li-btn--linkedin inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-[linear-gradient(135deg,var(--cl-linkedin)_0%,var(--cl-linkedin-2)_100%)] px-[18px] text-[var(--cl-text-xl)] font-bold text-[var(--cl-surface-white)] shadow-[var(--cl-shadow-linkedin)]" onClick={handleConnect} disabled={connectMutation.isPending || publishMutation.isPending || Boolean(session)}>
                  <LinkedInMark />
                  {session ? 'Connected' : 'Connect with LinkedIn'}
                </Button>
              </div>

              <div className="li-info rounded-xl border-[1.5px] border-[var(--cl-accent-soft-16)] bg-[var(--cl-accent-soft-10)] px-6 py-5">
                <h3 className="[font-family:var(--cl-font-serif)] text-[var(--cl-text-2xl)]">What we import from your profile</h3>
                <ul className="li-info__list mt-3 grid gap-2.5 pl-[18px] text-[var(--cl-text-xl)] leading-[1.65] text-[var(--cl-brown-alpha-76)]">
                  <li>Work experience, job titles, and employment dates</li>
                  <li>Project descriptions and achievements</li>
                  <li>Recommendations and endorsements</li>
                  <li>Skills and certifications</li>
                </ul>
              </div>
            </div>

            {session ? (
              <section className="li-review mt-2 border-t-[1.5px] border-t-[var(--cl-muted-12)] pt-6" aria-labelledby="linkedin-import-review-title">
                <div className="li-review__head mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="li-step-label inline-flex items-center text-[var(--cl-text-sm)] font-bold uppercase tracking-[0.08em] text-[var(--cl-accent-deep)]">Imported preview</p>
                    <h3 id="linkedin-import-review-title" className="mt-1 [font-family:var(--cl-font-serif)] text-[1.8rem]">{session.profile_name}</h3>
                    <p className="mt-2 text-[var(--cl-text-xl)] leading-[1.65] text-[var(--cl-brown-alpha-76)]">{session.headline || 'Professional snapshot'}</p>
                  </div>
                  <span className="li-review__count rounded-full bg-[var(--cl-linkedin-alpha-08)] px-3 py-2 text-[var(--cl-text-lg)] font-bold text-[var(--cl-linkedin)]">{selectedCount} selected</span>
                </div>

                <div className="li-review__items grid gap-[14px] min-[860px]:grid-cols-2" role="list" aria-label="Imported LinkedIn drafts">
                  {importItems.map((item) => (
                    <ImportCard key={item.id} item={item} onToggle={handleToggle} disabled={isBusy} updating={updatingItemId === item.id} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}

        <div className="li-actions mt-8 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="ghost" className="li-btn li-btn--secondary min-h-12 rounded-xl border-2 border-[var(--cl-muted-12)] bg-[var(--cl-dialog-surface)] px-[18px] text-[var(--cl-text-xl)] font-bold text-[var(--cl-brown)] shadow-none" onClick={handleSkip} disabled={isBusy}>Skip for now</Button>
          <Button type="button" variant="primary" className="li-btn li-btn--primary min-h-12 rounded-xl bg-[linear-gradient(135deg,var(--cl-accent-deep)_0%,var(--cl-accent-deeper)_100%)] px-[18px] text-[var(--cl-text-xl)] font-bold text-[var(--cl-surface-white)] shadow-[0_8px_24px_var(--cl-accent-soft-21)]" onClick={session ? handlePublish : handleConnect} disabled={isBusy || (!session && connectMutation.isPending)}>
            {session ? 'Publish to brag doc' : actionLabel}
          </Button>
        </div>

        {error ? <p className="li-error mt-4 text-[var(--cl-text-base)] text-[var(--cl-danger-4)]" role="alert">{error}</p> : null}
      </section>
    </>
  )
}
