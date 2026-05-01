'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@shared/components/ui/Button'
import { Link } from '@shared/components/ui/Link'
import { BrandMarkIcon } from '@shared/components/ui/icon/BrandMarkIcon'

const FLOATS = [
  { text: 'Led the platform migration with zero rollbacks', style: { left: '3%', top: '20%', '--rot': '-2deg', animationDuration: '8s', animationDelay: '0s' } },
  { text: 'Onboarded two new engineers this quarter', style: { left: '66%', top: '55%', '--rot': '1.5deg', animationDuration: '9s', animationDelay: '-3s' } },
  { text: 'Presented at the guild session with 40 attendees', style: { left: '58%', top: '15%', '--rot': '-1deg', animationDuration: '8.5s', animationDelay: '-5.5s' } },
  { text: 'Got the promotion conversation on the calendar', style: { left: '2%', top: '65%', '--rot': '2deg', animationDuration: '11s', animationDelay: '-2s' } },
  { text: 'Shipped the API redesign two weeks early', style: { left: '70%', top: '32%', '--rot': '-1.5deg', animationDuration: '10s', animationDelay: '-7s' } },
  { text: 'Peer-recognised for the observability work', style: { left: '28%', top: '78%', '--rot': '1deg', animationDuration: '9.5s', animationDelay: '-4s' } },
  { text: 'Cut CI run time by 40% and saved 15 dev hours per week', style: { left: '45%', top: '85%', '--rot': '-0.5deg', animationDuration: '12s', animationDelay: '-1s' } },
  { text: 'Mentored a junior dev to first shipped feature', style: { left: '82%', top: '72%', '--rot': '2.5deg', animationDuration: '7.5s', animationDelay: '-6s' } },
  { text: 'Unblocked the release and unstuck three teams', style: { left: '15%', top: '42%', '--rot': '-3deg', animationDuration: '9.8s', animationDelay: '-2.5s' } },
  { text: 'Designed the incident review process, adopted team wide', style: { left: '50%', top: '8%', '--rot': '1.2deg', animationDuration: '10.5s', animationDelay: '-8s' } },
  { text: 'Reduced pagerduty noise by 60%', style: { left: '88%', top: '48%', '--rot': '-1.8deg', animationDuration: '8.2s', animationDelay: '-4.5s' } },
  { text: 'Led the post-mortem culture with 12 runbooks written', style: { left: '38%', top: '92%', '--rot': '0.8deg', animationDuration: '11.5s', animationDelay: '-1.2s' } },
  { text: 'Shipped dark mode with 98% positive feedback', style: { left: '20%', top: '12%', '--rot': '-2.2deg', animationDuration: '9.2s', animationDelay: '-7.5s' } },
  { text: 'Interviewed 15 candidates and 3 were hired', style: { left: '75%', top: '88%', '--rot': '1.8deg', animationDuration: '7.8s', animationDelay: '-0.5s' } },
  { text: 'Refactored the legacy queue with zero downtime', style: { left: '52%', top: '68%', '--rot': '-1.2deg', animationDuration: '10.8s', animationDelay: '-3.8s' } },
  { text: 'Won the quarterly engineering excellence award', style: { left: '12%', top: '50%', '--rot': '2.2deg', animationDuration: '8.7s', animationDelay: '-5s' } },
  { text: 'Automated the on-call handoff and saved 2 hours per week', style: { left: '42%', top: '25%', '--rot': '-1.7deg', animationDuration: '9.3s', animationDelay: '-2.8s' } },
  { text: 'Led the security audit with 0 critical findings', style: { left: '78%', top: '62%', '--rot': '1.1deg', animationDuration: '10.2s', animationDelay: '-6.2s' } },
  { text: 'Shipped the mobile SDK with 5 external partners integrated', style: { left: '32%', top: '95%', '--rot': '-2.5deg', animationDuration: '11.8s', animationDelay: '-0.8s' } },
  { text: 'Reduced database load by 35% with one index change', style: { left: '62%', top: '5%', '--rot': '1.9deg', animationDuration: '8.9s', animationDelay: '-4.2s' } },
  { text: 'Ran the eng offsite with 98% satisfaction score', style: { left: '8%', top: '35%', '--rot': '-0.8deg', animationDuration: '9.7s', animationDelay: '-6.8s' } },
  { text: 'Wrote 8 RFCs, all approved and implemented', style: { left: '55%', top: '45%', '--rot': '2.3deg', animationDuration: '7.9s', animationDelay: '-1.5s' } },
  { text: 'Fixed the top customer reported bug in 24 hours', style: { left: '90%', top: '18%', '--rot': '-1.4deg', animationDuration: '10.6s', animationDelay: '-5.2s' } },
  { text: 'Launched the beta program with 200 signups week 1', style: { left: '18%', top: '60%', '--rot': '0.5deg', animationDuration: '8.4s', animationDelay: '-3.2s' } },
  { text: 'Cut cloud costs by $8k per month with no performance loss', style: { left: '48%', top: '40%', '--rot': '-2.8deg', animationDuration: '11.2s', animationDelay: '-7.8s' } },
  { text: 'Received "Above and Beyond" shoutout in all hands', style: { left: '85%', top: '80%', '--rot': '1.6deg', animationDuration: '9.1s', animationDelay: '-1.8s' } },
  { text: 'Migrated 10 services to k8s with 99.99% uptime', style: { left: '25%', top: '30%', '--rot': '-1.1deg', animationDuration: '10.4s', animationDelay: '-4.8s' } },
  { text: 'Unified auth across 4 products, 1 week ahead', style: { left: '68%', top: '98%', '--rot': '2deg', animationDuration: '8.1s', animationDelay: '-0.2s' } },
  { text: 'Spoke at internal summit with 150+ attendees', style: { left: '5%', top: '82%', '--rot': '-0.3deg', animationDuration: '9.6s', animationDelay: '-3.5s' } },
  { text: 'Delivered Q4 roadmap items with 100% completion', style: { left: '40%', top: '52%', '--rot': '1.3deg', animationDuration: '7.6s', animationDelay: '-6.5s' } },
]

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="nf-wrap fixed inset-0 flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[var(--cl-surface-warm)] px-6 py-12">
      <div className="nf-ruled pointer-events-none fixed inset-0 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_47px,var(--cl-rule-dark-2)_47px,var(--cl-rule-dark-2)_48px)]" aria-hidden="true" />

      <Link href="/" className="nf-logo fixed left-7 top-5 z-10 flex items-center gap-[9px] no-underline" aria-label="Clausule - home">
        <div className="nf-logo-bug flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--cl-surface-ink-3)]" aria-hidden="true">
          <BrandMarkIcon size={14} />
        </div>
        <span className="nf-logo-name text-[var(--cl-text-lg)] font-extrabold tracking-[-0.3px] text-[var(--cl-surface-ink-3)]">clausule</span>
      </Link>

      <div className="nf-floats pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {FLOATS.map(({ text, style }) => (
          <div key={text} className="nf-fe absolute whitespace-nowrap rounded-[var(--cl-radius-lg)] border border-[var(--cl-border-dark)] bg-[var(--cl-surface-paper-2)] px-3.5 py-2.5 text-[var(--cl-text-xs)] font-bold text-[var(--cl-surface-muted-8)] opacity-70" style={style}>
            <span className="nf-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--acc,var(--cl-accent))] align-middle" />
            {text}
          </div>
        ))}
      </div>

      <main className="nf-content relative z-[1] flex max-w-[440px] flex-col items-center text-center">
        <div className="nf-num flex items-center text-[140px] font-black leading-[0.9] tracking-[-8px] text-[var(--cl-surface-ink-3)] max-[480px]:text-[100px] max-[480px]:tracking-[-5px]" aria-label="404">
          <span aria-hidden="true">4</span>
          <div className="nf-doc relative flex h-[90px] w-[72px] -translate-y-1 flex-col items-start justify-center gap-[7px] rounded-lg bg-[var(--cl-surface-ink-3)] px-3 py-3.5 max-[480px]:h-[66px] max-[480px]:w-[52px]" role="img" aria-label="document">
            <div className="nf-doc-corner absolute -right-px -top-px h-[14px] w-[14px] rounded-tr-lg bg-[var(--cl-surface-warm)] after:absolute after:left-0 after:top-0 after:h-[14px] after:w-[14px] after:rounded-[0_8px_0_6px] after:bg-[var(--cl-ink-2)] after:content-['']" />
            <div className="nf-doc-line h-1 w-full rounded bg-[var(--cl-surface-warm)]" />
            <div className="nf-doc-line h-1 w-[72%] rounded bg-[var(--cl-surface-warm)]" />
            <div className="nf-doc-line h-1 w-[44%] rounded bg-[var(--acc,var(--cl-accent))]" />
          </div>
          <span aria-hidden="true">4</span>
        </div>

        <h1 className="nf-heading mb-2 mt-7 text-[26px] font-black tracking-[-0.6px] text-[var(--cl-surface-ink-3)]">This entry doesn't exist.</h1>
        <p className="nf-sub mb-8 text-[var(--cl-text-lg)] leading-[1.65] text-[var(--cl-surface-muted-4)]">
          Whatever you were looking for isn't in the file.
          <br />
          It might have been moved, deleted, or never written down.
        </p>

        <div className="nf-actions flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            className="nf-btn-secondary rounded-[var(--cl-radius-md)] border-[1.5px] border-[var(--cl-border-dark-4)] bg-transparent px-[22px] py-3 text-[var(--cl-text-base)] font-bold text-[var(--cl-ink-2)] shadow-none hover:border-[var(--cl-ink-alpha-20)]"
            onClick={() => router.back()}
            variant="ghost"
          >
            Go back
          </Button>
        </div>
      </main>
    </div>
  )
}
