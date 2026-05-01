
export function AchievementOrbitIllustration({ size = 200, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden="true" {...props}>
      <g className="be-empty-spoke be-empty-spoke--1 animate-pulse" opacity="0.16">
        <path d="M100 100 L160 140" stroke="#C46B4A" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--2 animate-pulse" opacity="0.16">
        <path d="M100 100 L40 140" stroke="#2E4052" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--3 animate-pulse" opacity="0.16">
        <path d="M100 100 L100 180" stroke="#E8C89A" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--4 animate-pulse" opacity="0.16">
        <path d="M100 100 L175 80" stroke="#A8C5B5" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--5 animate-pulse" opacity="0.16">
        <path d="M100 100 L25 80" stroke="#E8A898" strokeWidth="28" strokeLinecap="round" />
      </g>
      <circle className="be-empty-ring animate-pulse" cx="100" cy="100" r="72" stroke="#C46B4A" strokeWidth="1" strokeDasharray="6 10" strokeOpacity="0.2" />
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
  )
}
