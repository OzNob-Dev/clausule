export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-sans font-bold transition-opacity duration-150 cursor-pointer border-0 rounded-clausule'

  const variants = {
    primary:  'bg-[var(--acc)] text-white hover:opacity-90',
    employee: 'bg-[var(--acc)] text-white hover:opacity-90',
    ghost:    'bg-transparent text-[var(--ts)] border border-[var(--rule)] hover:bg-[rgba(255,255,255,0.05)]',
    danger:   'bg-[var(--rt)] text-[var(--canvas)] hover:opacity-90',
    confirm:  'bg-[var(--gt)] text-[var(--canvas)] hover:opacity-90',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs tracking-wide',
    md: 'px-4 py-2.5 text-[13px] tracking-[0.2px]',
    lg: 'px-5 py-3 text-sm',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
