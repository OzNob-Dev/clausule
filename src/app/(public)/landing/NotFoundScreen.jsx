'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@shared/components/ui/Button'
import { Link } from '@shared/components/ui/Link'
import '@landing/styles/not-found.css'

const FLOATS = [
  { text: 'Led the platform migration with zero rollbacks',    style: { left: '3%',  top: '20%', '--rot': '-2deg',  animationDuration: '8s',    animationDelay: '0s'   } },
  { text: 'Onboarded two new engineers this quarter',       style: { left: '66%', top: '55%', '--rot': '1.5deg', animationDuration: '9s',    animationDelay: '-3s'  } },
  { text: 'Presented at the guild session with 40 attendees', style: { left: '58%', top: '15%', '--rot': '-1deg',  animationDuration: '8.5s',  animationDelay: '-5.5s'} },
  { text: 'Got the promotion conversation on the calendar', style: { left: '2%',  top: '65%', '--rot': '2deg',   animationDuration: '11s',   animationDelay: '-2s'  } },
  { text: 'Shipped the API redesign two weeks early',       style: { left: '70%', top: '32%', '--rot': '-1.5deg',animationDuration: '10s',   animationDelay: '-7s'  } },
  { text: 'Peer-recognised for the observability work',     style: { left: '28%', top: '78%', '--rot': '1deg',   animationDuration: '9.5s',  animationDelay: '-4s'  } },
  { text: 'Cut CI run time by 40% and saved 15 dev hours per week', style: { left: '45%', top: '85%', '--rot': '-0.5deg', animationDuration: '12s', animationDelay: '-1s' } },
  { text: 'Mentored a junior dev to first shipped feature',   style: { left: '82%', top: '72%', '--rot': '2.5deg', animationDuration: '7.5s', animationDelay: '-6s' } },
  { text: 'Unblocked the release and unstuck three teams',    style: { left: '15%', top: '42%', '--rot': '-3deg',  animationDuration: '9.8s',  animationDelay: '-2.5s'} },
  { text: 'Designed the incident review process, adopted team wide', style: { left: '50%', top: '8%', '--rot': '1.2deg', animationDuration: '10.5s', animationDelay: '-8s' } },
  { text: 'Reduced pagerduty noise by 60%',                 style: { left: '88%', top: '48%', '--rot': '-1.8deg',animationDuration: '8.2s',  animationDelay: '-4.5s'} },
  { text: 'Led the post-mortem culture with 12 runbooks written', style: { left: '38%', top: '92%', '--rot': '0.8deg',  animationDuration: '11.5s',  animationDelay: '-1.2s'} },
  { text: 'Shipped dark mode with 98% positive feedback',      style: { left: '20%', top: '12%', '--rot': '-2.2deg',animationDuration: '9.2s',  animationDelay: '-7.5s'} },
  { text: 'Interviewed 15 candidates and 3 were hired',            style: { left: '75%', top: '88%', '--rot': '1.8deg',  animationDuration: '7.8s',  animationDelay: '-0.5s'} },
  { text: 'Refactored the legacy queue with zero downtime',    style: { left: '52%', top: '68%', '--rot': '-1.2deg',animationDuration: '10.8s', animationDelay: '-3.8s'} },
  { text: 'Won the quarterly engineering excellence award', style: { left: '12%', top: '50%', '--rot': '2.2deg',  animationDuration: '8.7s',  animationDelay: '-5s'  } },
  { text: 'Automated the on-call handoff and saved 2 hours per week',  style: { left: '42%', top: '25%', '--rot': '-1.7deg',animationDuration: '9.3s',  animationDelay: '-2.8s'} },
  { text: 'Led the security audit with 0 critical findings',   style: { left: '78%', top: '62%', '--rot': '1.1deg',  animationDuration: '10.2s', animationDelay: '-6.2s'} },
  { text: 'Shipped the mobile SDK with 5 external partners integrated', style: { left: '32%', top: '95%', '--rot': '-2.5deg', animationDuration: '11.8s', animationDelay: '-0.8s'} },
  { text: 'Reduced database load by 35% with one index change', style: { left: '62%', top: '5%', '--rot': '1.9deg',   animationDuration: '8.9s',  animationDelay: '-4.2s'} },
  { text: 'Ran the eng offsite with 98% satisfaction score',   style: { left: '8%',  top: '35%', '--rot': '-0.8deg', animationDuration: '9.7s',  animationDelay: '-6.8s'} },
  { text: 'Wrote 8 RFCs, all approved and implemented',    style: { left: '55%', top: '45%', '--rot': '2.3deg',  animationDuration: '7.9s',  animationDelay: '-1.5s'} },
  { text: 'Fixed the top customer reported bug in 24 hours',     style: { left: '90%', top: '18%', '--rot': '-1.4deg', animationDuration: '10.6s', animationDelay: '-5.2s'} },
  { text: 'Launched the beta program with 200 signups week 1', style: { left: '18%', top: '60%', '--rot': '0.5deg',  animationDuration: '8.4s',  animationDelay: '-3.2s'} },
  { text: 'Cut cloud costs by $8k per month with no performance loss', style: { left: '48%', top: '40%', '--rot': '-2.8deg', animationDuration: '11.2s', animationDelay: '-7.8s'} },
  { text: 'Received "Above and Beyond" shoutout in all hands', style: { left: '85%', top: '80%', '--rot': '1.6deg',  animationDuration: '9.1s',  animationDelay: '-1.8s'} },
  { text: 'Migrated 10 services to k8s with 99.99% uptime',    style: { left: '25%', top: '30%', '--rot': '-1.1deg', animationDuration: '10.4s', animationDelay: '-4.8s'} },
  { text: 'Unified auth across 4 products, 1 week ahead',  style: { left: '68%', top: '98%', '--rot': '2deg',    animationDuration: '8.1s',  animationDelay: '-0.2s'} },
  { text: 'Spoke at internal summit with 150+ attendees',      style: { left: '5%',  top: '82%', '--rot': '-0.3deg', animationDuration: '9.6s',  animationDelay: '-3.5s'} },
  { text: 'Delivered Q4 roadmap items with 100% completion',   style: { left: '40%', top: '52%', '--rot': '1.3deg',  animationDuration: '7.6s',  animationDelay: '-6.5s'} },
];
export default function NotFound() {
  const router = useRouter()

  return (
    <div className="nf-wrap">
      <div className="nf-ruled" aria-hidden="true" />

      {/* Logo */}
      <Link href="/" className="nf-logo" aria-label="Clausule — home">
        <div className="nf-logo-bug" aria-hidden="true">
          <svg viewBox="0 0 18 18" fill="none" stroke="#F5F0EA" strokeWidth="2.2" strokeLinecap="round" width="14" height="14">
            <path d="M3 5h12M3 9h8M3 13h5" />
          </svg>
        </div>
        <span className="nf-logo-name">clausule</span>
      </Link>

      {/* Floating brag entries */}
      <div className="nf-floats" aria-hidden="true">
        {FLOATS.map(({ text, style }) => (
          <div key={text} className="nf-fe" style={style}>
            <span className="nf-dot" />
            {text}
          </div>
        ))}
      </div>

      {/* Main content */}
      <main className="nf-content">
        <div className="nf-num" aria-label="404">
          <span aria-hidden="true">4</span>
          <div className="nf-doc" role="img" aria-label="document">
            <div className="nf-doc-corner" />
            <div className="nf-doc-line" />
            <div className="nf-doc-line" />
            <div className="nf-doc-line" />
          </div>
          <span aria-hidden="true">4</span>
        </div>

        <h1 className="nf-heading">This entry doesn't exist.</h1>
        <p className="nf-sub">
          Whatever you were looking for isn't in the file.<br />
          It might have been moved, deleted, or never written down.
        </p>

        <div className="nf-actions">
          <Button
            type="button"
            className="nf-btn-secondary"
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
