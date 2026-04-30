import { cn } from '@shared/utils/cn'
import './Button.css'
const variantStyles = {
  primary: 'be-cta--primary',
  employee: 'be-cta--employee',
  ghost: 'be-cta--ghost',
  danger: 'be-cta--danger',
  confirm: 'be-cta--confirm',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs tracking-[0.025em]',
  md: 'px-4 py-[10px] text-[13px] tracking-[0.2px]',
  lg: 'px-5 py-3 text-sm',
}

export function Button({ children, variant = 'primary', size = 'md', className, as: As = 'button', href, type = 'button', ...props }) {
  const classes = cn(
    'be-cta',
    variantStyles[variant] ?? variantStyles.primary,
    sizeStyles[size],
    className
  )

  if (As === 'a') {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
