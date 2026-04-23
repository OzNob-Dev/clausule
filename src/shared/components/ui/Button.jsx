import { cn } from '@shared/utils/cn'

const variantStyles = {
  primary: 'bg-acc text-[#FAF7F3] hover:opacity-90',
  employee: 'bg-acc text-[#FAF7F3] hover:opacity-90',
  ghost: 'bg-transparent text-ts border border-rule hover:bg-white/5',
  danger: 'bg-rt text-canvas hover:opacity-90',
  confirm: 'bg-gt text-canvas hover:opacity-90',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs tracking-[0.025em]',
  md: 'px-4 py-[10px] text-[13px] tracking-[0.2px]',
  lg: 'px-5 py-3 text-sm',
}

export function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-sans font-bold transition-opacity duration-150 cursor-pointer border-none rounded-[var(--r)]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
