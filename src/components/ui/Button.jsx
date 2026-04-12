export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-sans font-bold transition-opacity duration-150 cursor-pointer border-0 rounded-clausule'

  const variants = {
    primary: 'text-white hover:opacity-90',
    employee: 'text-white hover:opacity-90',
    ghost: 'bg-transparent border border-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,0.05)]',
    danger: 'text-white hover:opacity-90',
    confirm: 'text-white hover:opacity-90',
  }

  const variantStyles = {
    primary:  { background: 'var(--acc)', color: '#fff' },
    employee: { background: 'var(--acc)', color: '#fff' },
    ghost:    { background: 'transparent', color: 'var(--ts)', border: '1px solid var(--rule)' },
    danger:   { background: 'var(--rt)',  color: 'var(--canvas)' },
    confirm:  { background: 'var(--gt)', color: 'var(--canvas)' },
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs tracking-wide',
    md: 'px-4 py-2.5 text-[13px] tracking-[0.2px]',
    lg: 'px-5 py-3 text-sm',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={variantStyles[variant]}
      {...props}
    >
      {children}
    </button>
  )
}
