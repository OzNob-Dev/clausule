'use client'

import { useState } from 'react'
import { cn } from '@shared/utils/cn'
import { signupUi } from './signupClasses'

export function FieldLabel({ children, htmlFor }) {
  return <label className={signupUi.label} htmlFor={htmlFor}>{children}</label>
}

export function FieldInput({ error, onBlur, className = '', ...props }) {
  const [focused, setFocused] = useState(false)

  return (
    <input
      {...props}
      className={cn(
        signupUi.input,
        error && signupUi.inputError,
        focused && 'border-[#2A221A] shadow-[0_0_0_3px_rgba(60,45,35,0.08)]',
        className
      )}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
    />
  )
}
