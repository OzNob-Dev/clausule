'use client'

export function FieldLabel({ children, htmlFor }) {
  return <label className="su-field-label" htmlFor={htmlFor}>{children}</label>
}

export function FieldInput({ error, onBlur, className = '', ...props }) {
  return (
    <input
      {...props}
      className={`su-input${error ? ' su-input--error' : ''}${className ? ` ${className}` : ''}`}
      onBlur={(event) => {
        onBlur?.(event)
      }}
    />
  )
}
