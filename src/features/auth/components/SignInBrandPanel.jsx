import Link from 'next/link'

export function BrandBugIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 5h12M3 9h8M3 13h5" />
    </svg>
  )
}

export default function SignInBrandPanel({ brandHref = null }) {
  const BrandName = brandHref ? Link : 'span'

  return (
    <div className="su-shell-left">
      <div className="su-shell-logo">
        <div className="su-shell-bug">
          <BrandBugIcon />
        </div>
        <BrandName href={brandHref ?? undefined} className="su-shell-brand">clausule</BrandName>
      </div>
      <div className="su-shell-body">
        <h1 className="su-shell-headline">Thoughtful records.<br />Better conversations.</h1>
        <p className="su-shell-subtext">The file note tool built for managers who care about their people — and a brag doc for the people themselves.</p>
      </div>
      <div className="su-shell-footer">Built for teams who care</div>
    </div>
  )
}
