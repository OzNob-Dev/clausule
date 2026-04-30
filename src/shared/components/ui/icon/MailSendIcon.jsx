import './MailSendIcon.css'

export function MailSendIcon({ size = 72, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" aria-hidden="true" {...props}>
      <path d="M14 24h44v30H14V24Z" fill="currentColor" opacity="0.12" />
      <path d="M14 24h44v30H14V24Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="m15 26 21 17 21-17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M42 18 54 8l2 15 12 8-16 3-8 13-3-15-14-6 15-8Z" fill="#C94F2A" />
      <path d="M48 16 54 8l1 10 8 6-10 1-5 9-2-10-9-4 11-4Z" fill="#F8D37B" />
    </svg>
  )
}
