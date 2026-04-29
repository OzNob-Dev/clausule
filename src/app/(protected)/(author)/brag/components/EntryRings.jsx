export default function EntryRings({ offsets }) {
  const [outerOff, midOff, innerOff] = offsets
  return (
    <div className="be-entry-rings" aria-hidden="true">
      <svg viewBox="0 0 44 44" width="44" height="44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--cl-dialog-border)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--ring-outer)" strokeWidth="3.5" strokeDasharray="113.1" strokeDashoffset={outerOff} strokeLinecap="round" transform="rotate(-90 22 22)"/>
      </svg>
      <svg viewBox="0 0 44 44" width="44" height="44" className="be-entry-rings-overlay">
        <circle cx="22" cy="22" r="12" fill="none" stroke="var(--cl-dialog-border-2)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r="12" fill="none" stroke="var(--ring-mid)" strokeWidth="3.5" strokeDasharray="75.4" strokeDashoffset={midOff} strokeLinecap="round" transform="rotate(-90 22 22)"/>
      </svg>
      <svg viewBox="0 0 44 44" width="44" height="44" className="be-entry-rings-overlay">
        <circle cx="22" cy="22" r="6" fill="none" stroke="var(--cl-dialog-border-2)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r="6" fill="none" stroke={innerOff >= 37.7 ? 'var(--cl-dialog-border-4)' : 'var(--ring-inner)'} strokeWidth="3.5" strokeDasharray="37.7" strokeDashoffset={innerOff} strokeLinecap="round" transform="rotate(-90 22 22)"/>
      </svg>
    </div>
  )
}
