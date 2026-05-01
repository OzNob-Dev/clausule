'use client'

import dynamic from 'next/dynamic'
import PageHeader from '@shared/components/ui/PageHeader'

const ResumeTab = dynamic(() => import('@shared/components/ResumeTab'), {
  loading: () => <p className="be-entry-load-error" role="status">Loading resume workspace…</p>,
})

export default function ResumeScreen({ initialEntries = [], initialEntriesError = '' }) {
  return (
    <>
      <h1 id="brag-page-title" className="sr-only">Brag document</h1>
      {initialEntriesError ? (
        <p className="be-entry-load-error" role="alert">{initialEntriesError}</p>
      ) : (
        <section aria-labelledby="resume-page-title">
          <PageHeader
            className="be-doc-header max-w-[760px] border-b border-[var(--cl-ink-alpha-12)] pb-7"
            eyebrow="Your achievements"
            eyebrowClassName="be-doc-eyebrow mb-3 block text-[var(--cl-text-xs)] font-bold uppercase tracking-[2.5px] text-[var(--cl-accent-deep)]"
            title="Resume"
            titleClassName="be-doc-title [font-family:'DM_Serif_Display',Georgia,serif] text-[44px] leading-none tracking-[-1.5px] text-[var(--cl-surface-ink-2)]"
            titleId="resume-page-title"
          />
          <ResumeTab entries={initialEntries} />
        </section>
      )}
    </>
  )
}
