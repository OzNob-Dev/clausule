
export function AchievementOrbitIllustration({ size = 200, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden="true" {...props}>
      <g className="be-empty-spoke be-empty-spoke--1 animate-pulse" opacity="0.2">
        <path d="M100 100 L160 140" stroke="#C46B4A" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--2 animate-pulse" opacity="0.15">
        <path d="M100 100 L40 140" stroke="#7D8B97" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--3 animate-pulse" opacity="0.15">
        <path d="M100 100 L100 180" stroke="#E0C39A" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--4 animate-pulse" opacity="0.15">
        <path d="M100 100 L175 80" stroke="#B8C8BC" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g className="be-empty-spoke be-empty-spoke--5 animate-pulse" opacity="0.15">
        <path d="M100 100 L25 80" stroke="#DDB2A3" strokeWidth="28" strokeLinecap="round" />
      </g>
      <circle className="be-empty-ring animate-pulse" cx="100" cy="100" r="72" stroke="#C46B4A" strokeWidth="1" strokeDasharray="6 10" strokeOpacity="0.28" />
      <g className="be-empty-hub">
        <circle cx="100" cy="100" r="38" fill="#FCF8F2" />
        <rect x="82" y="72" width="36" height="44" rx="4" stroke="#C46B4A" strokeWidth="1.8" />
        <g className="be-empty-doc-lines">
          <path d="M88 85h24M88 92h24M88 99h16" stroke="#C46B4A" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M88 107h10" stroke="#C46B4A" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </g>
      <g className="be-empty-sat be-empty-sat--1">
        <circle cx="136" cy="64" r="10" fill="#FCF8F2" stroke="#C46B4A" strokeWidth="1.5" />
        <path d="M136 60v4l2 2" stroke="#C46B4A" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <g className="be-empty-sat be-empty-sat--2">
        <circle cx="64" cy="64" r="8" fill="#FCF8F2" stroke="#7D8B97" strokeWidth="1.5" />
        <path d="M61 64l2 2 4-4" stroke="#7D8B97" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="be-empty-sat be-empty-sat--3">
        <circle cx="148" cy="118" r="7" fill="#FCF8F2" stroke="#D58A63" strokeWidth="1.5" />
        <path d="M146 118h4M148 116v4" stroke="#D58A63" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  )
}
