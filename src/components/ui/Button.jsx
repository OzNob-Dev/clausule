export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-sans font-medium transition-opacity duration-150 cursor-pointer border-0 rounded-ledger'

  const variants = {
    primary: 'bg-nav text-[#E8ECF8] hover:opacity-90',
    employee: 'bg-[#534AB7] text-[#E8ECF8] hover:opacity-90',
    ghost: 'bg-transparent border border-[rgba(0,0,0,0.09)] text-ts hover:bg-[rgba(0,0,0,0.02)]',
    danger: 'bg-[#E24B4A] text-white hover:opacity-90',
    confirm: 'bg-[#2B5E2E] text-white hover:opacity-90',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs tracking-wide',
    md: 'px-4 py-2.5 text-[13px] tracking-[0.2px]',
    lg: 'px-5 py-3 text-sm',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
