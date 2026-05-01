import Link from 'next/link'
import { BrandMarkIcon } from '@shared/components/ui/icon/BrandMarkIcon'
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
    <div className="su-shell-left flex w-[268px] shrink-0 flex-col justify-between bg-[var(--cl-surface-ink)] px-7 py-8 max-[640px]:hidden">
      <div className="su-shell-logo flex items-center gap-[9px]">
        <div className="su-shell-bug flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--cl-radius-md)] bg-[var(--cl-accent)] text-[var(--cl-surface-paper)]">
          <BrandMarkIcon />
        </div>
        <BrandName
          href={brandHref ?? undefined}
          className="su-shell-brand text-[var(--cl-text-lg)] font-extrabold text-[var(--cl-surface-paper)] no-underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cl-accent)]"
        >
          clausule
        </BrandName>
      </div>
      <div className="su-shell-body flex flex-col gap-3">
        <h1 className="su-shell-headline m-0 text-[26px] font-black leading-[1.15] tracking-[-0.8px] text-[var(--cl-surface-paper)]">
          {headline.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </h1>
        <p className="su-shell-subtext m-0 text-[var(--cl-text-md)] leading-[1.7] text-[var(--cl-surface-muted-11)]">{subtext}</p>
      </div>
      {children}
    </div>
  )
}
