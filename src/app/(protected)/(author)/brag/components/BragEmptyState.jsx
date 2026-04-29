const PROMPTS = [
  {
    title: 'Log a recent win',
    hint: 'Something shipped, solved, or delivered',
    icon: 'M8 21h8M12 17v4M17 3H7l-1 8h10l-1-8zM7 11c0 2.76 2.24 5 5 5s5-2.24 5-5',
  },
  {
    title: 'Capture feedback you received',
    hint: 'Praise from a manager, peer, or stakeholder',
    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM8 9h8M8 12h5',
  },
  {
    title: 'Note a challenge you overcame',
    hint: 'A hard problem, a tough conversation, a comeback',
    icon: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  },
]

export default function BragEmptyState({ onAddEntry }) {
  const handleStart = (event) => {
    event.preventDefault()
    onAddEntry?.()
  }

  return (
    <section className="be-empty" aria-labelledby="brag-empty-title">
      <div className="be-empty-hero" aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none">
          <g className="be-empty-spoke be-empty-spoke--1" opacity="0.16">
            <path d="M100 100 L160 140" stroke="#C46B4A" strokeWidth="28" strokeLinecap="round" />
          </g>
          <g className="be-empty-spoke be-empty-spoke--2" opacity="0.16">
            <path d="M100 100 L40 140" stroke="#2E4052" strokeWidth="28" strokeLinecap="round" />
          </g>
          <g className="be-empty-spoke be-empty-spoke--3" opacity="0.16">
            <path d="M100 100 L100 180" stroke="#E8C89A" strokeWidth="28" strokeLinecap="round" />
          </g>
          <g className="be-empty-spoke be-empty-spoke--4" opacity="0.16">
            <path d="M100 100 L175 80" stroke="#A8C5B5" strokeWidth="28" strokeLinecap="round" />
          </g>
          <g className="be-empty-spoke be-empty-spoke--5" opacity="0.16">
            <path d="M100 100 L25 80" stroke="#E8A898" strokeWidth="28" strokeLinecap="round" />
          </g>
          <circle className="be-empty-ring" cx="100" cy="100" r="72" stroke="#C46B4A" strokeWidth="1" strokeDasharray="6 10" strokeOpacity="0.2" />
          <g className="be-empty-hub">
            <circle cx="100" cy="100" r="38" fill="#FAF3EB" />
            <rect x="82" y="72" width="36" height="44" rx="4" stroke="#C46B4A" strokeWidth="1.8" />
            <g className="be-empty-doc-lines">
              <path d="M88 85h24M88 92h24M88 99h16" stroke="#C46B4A" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M88 107h10" stroke="#C46B4A" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          </g>
          <g className="be-empty-sat be-empty-sat--1">
            <circle cx="136" cy="64" r="10" fill="#F7F3EE" stroke="#C46B4A" strokeWidth="1.5" />
            <path d="M136 60v4l2 2" stroke="#C46B4A" strokeWidth="1.4" strokeLinecap="round" />
          </g>
          <g className="be-empty-sat be-empty-sat--2">
            <circle cx="64" cy="64" r="8" fill="#F7F3EE" stroke="#2E4052" strokeWidth="1.5" />
            <path d="M61 64l2 2 4-4" stroke="#2E4052" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g className="be-empty-sat be-empty-sat--3">
            <circle cx="148" cy="118" r="7" fill="#F7F3EE" stroke="#E8A070" strokeWidth="1.5" />
            <path d="M146 118h4M148 116v4" stroke="#E8A070" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      <p className="be-empty-eyebrow">Your brag doc awaits</p>
      <h2 id="brag-empty-title" className="be-empty-title">
        You&apos;ve done great things.<br />
        Start <em>writing them down.</em>
      </h2>
      <p className="be-empty-copy">
        Your brag doc is a running record of wins, impact, and growth. It turns <strong>review season from stressful to confident.</strong>
      </p>

      <ul className="be-empty-prompts" role="list" aria-label="Ways to start your brag doc">
        {PROMPTS.map((prompt) => (
          <li key={prompt.title} className="be-empty-prompt-item">
            <button type="button" className="be-empty-prompt" aria-label={`${prompt.title} - ${prompt.hint}`} onClick={handleStart}>
              <span className="be-empty-prompt-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d={prompt.icon} />
                </svg>
              </span>
              <span className="be-empty-prompt-text">
                <span className="be-empty-prompt-title">{prompt.title}</span>
                <span className="be-empty-prompt-hint">{prompt.hint}</span>
              </span>
              <span className="be-empty-prompt-arrow" aria-hidden="true">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="7" x2="13" y2="7" />
                  <polyline points="8,2 13,7 8,12" />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="be-cta" onClick={handleStart}>
        <span className="be-cta-icon" aria-hidden="true">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="2" x2="7" y2="12" />
            <line x1="2" y1="7" x2="12" y2="7" />
          </svg>
        </span>
        Add your first entry
      </button>
      <p className="be-empty-note">Takes 30 seconds. Future-you will be grateful.</p>
    </section>
  )
}
