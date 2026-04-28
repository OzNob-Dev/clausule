import { forwardRef } from 'react'
import { cn } from '@shared/utils/cn'
import { areaClass, fieldClass } from '@shared/constants/classNames'

export function Field({ className = '', children, ...props }) {
  return (
    <div className={cn('grid gap-2', className)} {...props}>
      {children}
    </div>
  )
}

export function FieldLabel({ children, className = '', ...props }) {
  return (
    <label className={cn('su-field-label', className)} {...props}>
      {children}
    </label>
  )
}

export const FieldInput = forwardRef(function FieldInput({ error = false, className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      {...props}
      aria-invalid={props['aria-invalid'] ?? (error || undefined)}
      className={cn('su-input', error && 'su-input--error', className)}
    />
  )
})

export const FieldSelect = forwardRef(function FieldSelect({ error = false, className = '', ...props }, ref) {
  return (
    <select
      ref={ref}
      {...props}
      aria-invalid={props['aria-invalid'] ?? (error || undefined)}
      className={cn(fieldClass, error && 'su-input--error', className)}
    />
  )
})

export const FieldTextarea = forwardRef(function FieldTextarea({ error = false, className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      {...props}
      aria-invalid={props['aria-invalid'] ?? (error || undefined)}
      className={cn(areaClass, error && 'su-input--error', className)}
    />
  )
})

export const FieldCheckbox = forwardRef(function FieldCheckbox({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      {...props}
      type="checkbox"
      className={cn('h-4 w-4 shrink-0 rounded border-rule text-acc focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc', className)}
    />
  )
})

export function FieldHint({ error = false, className = '', children, ...props }) {
  return (
    <p className={cn('su-field-hint', error && 'su-field-hint--error', className)} {...props}>
      {children}
    </p>
  )
}
