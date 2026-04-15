export default function EntryRings({ offsets }) {
  const [outerOff, midOff, innerOff] = offsets
  return (
    <div className="be-entry-rings" aria-hidden="true">
      <svg viewBox="0 0 44 44" width="44" height="44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(180,140,110,0.12)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r="18" fill="none" strokeWidth="3.5"
          style={{ stroke: 'var(--ring-outer)' }}
          strokeDasharray="113.1" strokeDashoffset={outerOff} strokeLinecap="round"
          transform="rotate(-90 22 22)"/>
      </svg>
      <svg viewBox="0 0 44 44" width="44" height="44" className="be-entry-rings-overlay">
        <circle cx="22" cy="22" r="12" fill="none" stroke="rgba(180,140,110,0.1)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r="12" fill="none" strokeWidth="3.5"
          style={{ stroke: 'var(--ring-mid)' }}
          strokeDasharray="75.4" strokeDashoffset={midOff} strokeLinecap="round"
          transform="rotate(-90 22 22)"/>
      </svg>
      <svg viewBox="0 0 44 44" width="44" height="44" className="be-entry-rings-overlay">
        <circle cx="22" cy="22" r="6" fill="none" stroke="rgba(180,140,110,0.1)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r="6" fill="none" strokeWidth="3.5"
          style={{ stroke: innerOff >= 37.7 ? 'rgba(180,140,110,0.18)' : 'var(--ring-inner)' }}
          strokeDasharray="37.7" strokeDashoffset={innerOff} strokeLinecap="round"
          transform="rotate(-90 22 22)"/>
      </svg>
    </div>
  )
}
