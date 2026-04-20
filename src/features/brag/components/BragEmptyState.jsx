const PROMPTS = [
  {
    title: 'Log a recent win',
    hint: 'Something shipped, solved, or delivered',
    icon: 'M8 2.5h5v3a5 5 0 0 1-10 0v-3h5Zm-5 1H1.5a2 2 0 0 0 0 4H3m10-4h1.5a2 2 0 0 1 0 4H13M8 10.5v2m-3 1.5h6',
  },
  {
    title: 'Capture feedback you received',
    hint: 'Praise from a manager, peer, or stakeholder',
    icon: 'M2.5 3h11v7h-6l-3.5 3v-3H2.5V3Zm3 3h5m-5 2h3',
  },
  {
    title: 'Note a challenge you overcame',
    hint: 'A hard problem, a tough conversation, a comeback',
    icon: 'M8.7 1.8 3.8 8h3.4l-.9 6.2L12.2 7H8.6l.1-5.2Z',
  },
]

export default function BragEmptyState({ onAddEntry }) {
  return (
    <section className="be-empty" aria-labelledby="brag-empty-title">
      <div className="be-empty-trophy" aria-hidden="true">
        <div className="be-empty-halo" />
        <span className="be-empty-sparkle" />
        <span className="be-empty-sparkle" />
        <span className="be-empty-sparkle" />
        <span className="be-empty-sparkle" />
        <div className="be-empty-stage">
          <svg className="be-empty-trophy-svg" viewBox="0 0 80 80" fill="none">
            <path d="M24 14h32v22c0 10-7 18-16 18S24 46 24 36V14z" fill="currentColor" opacity="0.14" />
            <path d="M24 14h32v22c0 10-7 18-16 18S24 46 24 36V14z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M24 18h-6a6 6 0 0 0 0 12h6M56 18h6a6 6 0 0 1 0 12h-6M40 54v8M30 62h20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <path d="m40 24 2 5h5l-4 3 1.5 5L40 34l-4.5 3 1.5-5-4-3h5l2-5Z" fill="currentColor" opacity="0.7" />
          </svg>
        </div>
      </div>

      <p className="be-empty-eyebrow">Your brag doc awaits</p>
      <h2 id="brag-empty-title" className="be-empty-title">You&apos;ve done great things. Start writing them down.</h2>
      <p className="be-empty-copy">
        Your brag doc is a running record of wins, impact, and growth. It turns review season from stressful to confident.
      </p>

      <div className="be-empty-prompts" aria-label="Entry prompts to get started">
        {PROMPTS.map((prompt) => (
          <div key={prompt.title} className="be-empty-prompt">
            <span className="be-empty-prompt-icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={prompt.icon} />
              </svg>
            </span>
            <span className="be-empty-prompt-text">
              <span className="be-empty-prompt-title">{prompt.title}</span>
              <span className="be-empty-prompt-hint">{prompt.hint}</span>
            </span>
          </div>
        ))}
      </div>

      <button type="button" className="be-empty-cta" onClick={onAddEntry}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M8 3v10M3 8h10" />
        </svg>
        Add your first entry
      </button>
      <p className="be-empty-note">Takes 30 seconds. Future-you will be grateful.</p>
    </section>
  )
}
