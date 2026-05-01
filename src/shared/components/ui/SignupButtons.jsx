import { BackIcon } from '@shared/components/ui/icon/BackIcon'
import { Button } from './Button'
import { Link } from './Link'
export function CtaBtn({ onClick, terra = false, children, as: As = 'button', href, ...props }) {
  const className = `su-cta-btn w-full justify-center gap-2 rounded-[var(--su-r)] border-0 bg-[var(--su-acc)] px-[15px] py-[15px] [font-family:var(--su-font)] text-[var(--cl-text-lg)] font-extrabold tracking-[-0.2px] text-[var(--su-canvas)] shadow-none hover:bg-[var(--su-acc)] hover:opacity-88 hover:translate-y-0 disabled:cursor-default disabled:opacity-60${terra ? ' su-cta-btn--terra' : ''}`

  if (As === 'a') {
    return <Link href={href} variant="button" className={className}>{children}</Link>
  }

  return <Button onClick={onClick} className={className} type={props.type ?? 'button'} {...props}>{children}</Button>
}

export function BackBtn({ onClick }) {
  return (
    <Button
      onClick={onClick}
      className="su-back-btn mt-4 w-full justify-center gap-[5px] border-0 bg-transparent px-0 py-0 [font-family:var(--su-font)] text-[var(--cl-text-md)] font-semibold text-[var(--su-tx3)] shadow-none hover:bg-transparent hover:text-[var(--su-tx1)] hover:opacity-100 focus-visible:outline-[var(--su-tx1)]"
      type="button"
      variant="ghost"
    >
      <BackIcon /> Back
    </Button>
  )
}
