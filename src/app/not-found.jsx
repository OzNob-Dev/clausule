'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '@/styles/not-found.css'

const FLOATS = [
  { text: 'Led the platform migration — zero rollbacks',    style: { left: '3%',  top: '20%', '--rot': '-2deg',  animationDuration: '8s',    animationDelay: '0s'   } },
  { text: 'Onboarded two new engineers this quarter',       style: { left: '66%', top: '55%', '--rot': '1.5deg', animationDuration: '9s',    animationDelay: '-3s'  } },
  { text: 'Presented at the guild session — 40 attendees', style: { left: '58%', top: '15%', '--rot': '-1deg',  animationDuration: '8.5s',  animationDelay: '-5.5s'} },
  { text: 'Got the promotion conversation on the calendar', style: { left: '2%',  top: '65%', '--rot': '2deg',   animationDuration: '11s',   animationDelay: '-2s'  } },
  { text: 'Shipped the API redesign two weeks early',       style: { left: '70%', top: '32%', '--rot': '-1.5deg',animationDuration: '10s',   animationDelay: '-7s'  } },
  { text: 'Peer-recognised for the observability work',     style: { left: '28%', top: '78%', '--rot': '1deg',   animationDuration: '9.5s',  animationDelay: '-4s'  } },
]

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
          <button
            type="button"
            className="nf-btn-secondary"
            onClick={() => router.back()}
          >
            Go back
          </button>
        </div>
      </main>
    </div>
  )
}
