'use client'

import { useState } from 'react'

export function FieldLabel({ children }) {
  return <label className="su-field-label">{children}</label>
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
