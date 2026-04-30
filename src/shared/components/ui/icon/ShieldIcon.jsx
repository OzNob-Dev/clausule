import './Icon.css'

export function ShieldIcon() {
  return (
    <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 8 L40 14 L40 26 C40 34 33 40 26 44 C19 40 12 34 12 26 L12 14 Z" stroke="var(--cl-dialog-delete-icon-accent)" strokeWidth="1.6" fill="var(--cl-dialog-delete-icon-fill-2)" strokeLinejoin="round" />
      <path d="M26 12 L24 20 L28 24 L23 36" stroke="var(--cl-dialog-delete-icon-accent-2)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M28 24 L33 28 L31 34" stroke="var(--cl-dialog-delete-icon-accent-2)" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7" />
      <line x1="21" y1="21" x2="31" y2="31" stroke="var(--cl-dialog-delete-icon-cross)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="31" y1="21" x2="21" y2="31" stroke="var(--cl-dialog-delete-icon-cross)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
