'use client'

import { useState } from 'react'

export function FieldLabel({ children, htmlFor }) {
  return <label className="su-field-label" htmlFor={htmlFor}>{children}</label>
}

export function FieldInput({ error, onBlur, className = '', ...props }) {
  const [focused, setFocused] = useState(false)

  return (
    <input
      {...props}
      className={`su-input${error ? ' su-input--error' : ''}${focused ? ' su-input--focused' : ''}${className ? ` ${className}` : ''}`}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
    />
  )
}
