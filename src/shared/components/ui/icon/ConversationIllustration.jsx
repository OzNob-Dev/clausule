export function ConversationIllustration({ size = 220, ...props }) {
  return (
    <svg width={size} height="160" viewBox="0 0 220 160" fill="none" aria-hidden="true" {...props}>
      <g className="be-feedback-empty-state__bubble be-feedback-empty-state__bubble--one">
        <rect x="10" y="96" width="90" height="38" rx="10" fill="#FFF" stroke="rgba(28,26,23,0.1)" strokeWidth="0.8" />
        <rect x="10" y="128" width="12" height="8" rx="0 0 0 6" fill="#FFF" stroke="rgba(28,26,23,0.1)" strokeWidth="0.8" />
        <rect x="21" y="108" width="44" height="5" rx="2.5" fill="#E0D9CE" />
        <rect x="21" y="118" width="30" height="5" rx="2.5" fill="#E0D9CE" />
      </g>
      <g className="be-feedback-empty-state__bubble be-feedback-empty-state__bubble--two">
        <rect x="116" y="50" width="96" height="44" rx="10" fill="#FAF0EA" stroke="rgba(196,107,74,0.2)" strokeWidth="0.8" />
        <rect x="198" y="88" width="14" height="8" rx="0 0 6 0" fill="#FAF0EA" stroke="rgba(196,107,74,0.2)" strokeWidth="0.8" />
        <rect x="126" y="63" width="50" height="5" rx="2.5" fill="#E8C4B4" />
        <rect x="126" y="73" width="36" height="5" rx="2.5" fill="#E8C4B4" />
      </g>
      <g className="be-feedback-empty-state__bubble be-feedback-empty-state__bubble--three">
        <rect x="10" y="20" width="98" height="44" rx="10" fill="#FFF" stroke="rgba(28,26,23,0.1)" strokeWidth="0.8" />
        <rect x="10" y="56" width="14" height="10" rx="0 0 0 6" fill="#FFF" stroke="rgba(28,26,23,0.1)" strokeWidth="0.8" />
        <rect x="22" y="32" width="56" height="5" rx="2.5" fill="#E0D9CE" />
        <rect x="22" y="42" width="40" height="5" rx="2.5" fill="#E0D9CE" />
        <rect x="22" y="52" width="48" height="5" rx="2.5" fill="#E0D9CE" />
      </g>
      <g className="be-feedback-empty-state__bubble be-feedback-empty-state__bubble--four">
        <rect x="114" y="110" width="96" height="36" rx="10" fill="#FAF0EA" stroke="rgba(196,107,74,0.2)" strokeWidth="0.8" />
        <rect x="196" y="140" width="14" height="7" rx="0 0 6 0" fill="#FAF0EA" stroke="rgba(196,107,74,0.2)" strokeWidth="0.8" />
        <circle className="be-feedback-empty-state__dot be-feedback-empty-state__dot--one" cx="149" cy="128" r="3.5" fill="#C46B4A" />
        <circle className="be-feedback-empty-state__dot be-feedback-empty-state__dot--two" cx="162" cy="128" r="3.5" fill="#C46B4A" />
        <circle className="be-feedback-empty-state__dot be-feedback-empty-state__dot--three" cx="175" cy="128" r="3.5" fill="#C46B4A" />
      </g>
      <g className="be-feedback-empty-state__arrow">
        <circle cx="110" cy="80" r="14" fill="#EAE4DA" />
        <path d="M104 80h12M110 74l6 6-6 6" stroke="#C46B4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
