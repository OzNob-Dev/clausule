import { BackIcon } from './SignupIcons'
import { cn } from '@shared/utils/cn'
import { signupUi } from './signupClasses'

export function CtaBtn({ onClick, terra = false, children, as: As = 'button', href, ...props }) {
  const className = cn(signupUi.cta, terra && signupUi.ctaTerra)

  if (As === 'a') {
    return <a href={href} className={className}>{children}</a>
  }

  return <button onClick={onClick} className={className} {...props}>{children}</button>
}

export function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className={signupUi.back} type="button">
      <BackIcon /> Back
    </button>
  )
}
