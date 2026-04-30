import Link from 'next/link'
import { BrandMarkIcon } from '@shared/components/ui/icon/BrandMarkIcon'
import './SignInBrandPanel.css'
const DEFAULT_HEADLINE = 'Thoughtful records.\nBetter conversations.'
const DEFAULT_SUBTEXT = 'The file note tool built for managers who care about their people — and a brag doc for the people themselves.'

export default function SignInBrandPanel({
  brandHref = null,
  headline = DEFAULT_HEADLINE,
  subtext = DEFAULT_SUBTEXT,
  children,
}) {
  const BrandName = brandHref ? Link : 'span'

  return (
    <div className="su-shell-left">
      <div className="su-shell-logo">
        <div className="su-shell-bug">
          <BrandMarkIcon />
        </div>
        <BrandName href={brandHref ?? undefined} className="su-shell-brand">clausule</BrandName>
      </div>
      <div className="su-shell-body">
        <h1 className="su-shell-headline">
          {headline.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </h1>
        <p className="su-shell-subtext">{subtext}</p>
      </div>
      {children}
    </div>
  )
}
