
export function AchievementOrbitIllustration({ size = 200, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden="true" {...props}>
      <g className="be-empty-spoke be-empty-spoke--1 animate-pulse" opacity="0.16">
        <path d="M100 100 L160 140" stroke="var(--cl-accent-deep)" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--2 animate-pulse" opacity="0.16">
        <path d="M100 100 L40 140" stroke="var(--cl-blue)" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--3 animate-pulse" opacity="0.16">
        <path d="M100 100 L100 180" stroke="var(--cl-gold)" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--4 animate-pulse" opacity="0.16">
        <path d="M100 100 L175 80" stroke="var(--cl-success-3)" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--5 animate-pulse" opacity="0.16">
        <path d="M100 100 L25 80" stroke="var(--cl-dialog-delete-icon-accent-2)" strokeWidth="28" strokeLinecap="round" />
      </g>
      <circle className="be-empty-ring animate-pulse" cx="100" cy="100" r="72" stroke="var(--cl-accent-deep)" strokeWidth="1" strokeDasharray="6 10" strokeOpacity="0.2" />
      <g className="be-empty-hub">
        <circle cx="100" cy="100" r="38" fill="var(--cl-surface-paper)" />
        <rect x="82" y="72" width="36" height="44" rx="4" stroke="var(--cl-accent-deep)" strokeWidth="1.8" />
        <g className="be-empty-doc-lines">
          <path d="M88 85h24M88 92h24M88 99h16" stroke="var(--cl-accent-deep)" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M88 107h10" stroke="var(--cl-accent-deep)" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </g>
      <g className="be-empty-sat be-empty-sat--1">
        <circle cx="136" cy="64" r="10" fill="var(--cl-surface-warm)" stroke="var(--cl-accent-deep)" strokeWidth="1.5" />
        <path d="M136 60v4l2 2" stroke="var(--cl-accent-deep)" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <g className="be-empty-sat be-empty-sat--2">
        <circle cx="64" cy="64" r="8" fill="var(--cl-surface-warm)" stroke="var(--cl-blue)" strokeWidth="1.5" />
        <path d="M61 64l2 2 4-4" stroke="var(--cl-blue)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="be-empty-sat be-empty-sat--3">
        <circle cx="148" cy="118" r="7" fill="var(--cl-surface-warm)" stroke="var(--cl-gold-2)" strokeWidth="1.5" />
        <path d="M146 118h4M148 116v4" stroke="var(--cl-gold-2)" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  )
}
