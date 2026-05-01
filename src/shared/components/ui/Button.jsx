import { cn } from '@shared/utils/cn'

const variantStyles = {
  primary: 'be-cta--primary text-[var(--cl-surface-warm)] bg-[var(--cl-accent-strong)] hover:bg-[color-mix(in_srgb,var(--acc)_88%,black)] focus-visible:outline-[var(--cl-accent-strong)]',
  employee: 'be-cta--employee text-[var(--cl-surface-warm)] bg-[var(--cl-accent-strong)] hover:bg-[color-mix(in_srgb,var(--acc)_88%,black)] focus-visible:outline-[var(--cl-accent-strong)]',
  ghost: 'be-cta--ghost border border-rule bg-transparent text-ts shadow-none hover:bg-[color-mix(in_srgb,var(--canvas)_95%,var(--tp))] focus-visible:outline-rule',
  danger: 'be-cta--danger bg-transparent text-[var(--cl-danger-5)] shadow-none hover:bg-[color-mix(in_srgb,var(--rt)_90%,black)] hover:text-[color-mix(in_srgb,var(--cl-danger-5)_90%,black)] focus-visible:outline-[var(--cl-accent-strong)]',
  confirm: 'be-cta--confirm text-canvas bg-[var(--cl-success-3)] hover:bg-[color-mix(in_srgb,var(--gt)_90%,black)] focus-visible:outline-[var(--cl-accent-strong)]',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs tracking-[0.025em]',
  md: 'px-4 py-[10px] text-[13px] tracking-[0.2px]',
  lg: 'px-5 py-3 text-sm',
}

export function Button({ children, variant = 'primary', size = 'md', className, as: As = 'button', href, type = 'button', ...props }) {
  const classes = cn(
    'be-cta inline-flex items-center gap-3 whitespace-nowrap rounded-[10px] border-0 font-sans text-[var(--cl-text-lg)] font-bold no-underline shadow-[0_4px_16px_var(--cl-accent-alpha-25),0_12px_40px_var(--cl-accent-soft-16)] transition-[background,transform,box-shadow,opacity,color,border-color] duration-150 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-[0.55] max-[560px]:w-full max-[560px]:justify-center motion-reduce:transition-none motion-reduce:hover:translate-y-0',
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
