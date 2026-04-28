import { BackIcon } from './SignupIcons'
import { Button } from '@shared/components/ui/Button'
import { Link } from '@shared/components/ui/Link'

export function CtaBtn({ onClick, terra = false, children, as: As = 'button', href, ...props }) {
  const className = `su-cta-btn${terra ? ' su-cta-btn--terra' : ''}`

  if (As === 'a') {
    return <Link href={href} variant="button" className={className}>{children}</Link>
  }

  return <Button onClick={onClick} className={className} type={props.type ?? 'button'} {...props}>{children}</Button>
}

export function BackBtn({ onClick }) {
  return (
    <Button onClick={onClick} className="su-back-btn" type="button" variant="ghost">
      <BackIcon /> Back
    </Button>
  )
}
