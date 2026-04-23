import { BackIcon } from './SignupIcons'

export function CtaBtn({ onClick, terra = false, children, as: As = 'button', href, ...props }) {
  const className = `su-cta-btn${terra ? ' su-cta-btn--terra' : ''}`

  if (As === 'a') {
    return <a href={href} className={className}>{children}</a>
  }

  return <button onClick={onClick} className={className} {...props}>{children}</button>
}

export function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="su-back-btn" type="button">
      <BackIcon /> Back
    </button>
  )
}
