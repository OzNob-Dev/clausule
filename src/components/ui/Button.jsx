import '../../styles/button.css'

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button
      className={`btn btn--${variant} btn--${size}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </button>
  )
}
