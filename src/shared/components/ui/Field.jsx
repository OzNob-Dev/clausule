import { forwardRef } from 'react'
import { cn } from '@shared/utils/cn'
import { areaClass, fieldClass } from '@shared/constants/classNames'

const labelClass =
  'su-field-label block mb-[7px] text-[var(--cl-text-2xs)] font-bold uppercase tracking-[0.8px] text-[var(--su-tx3,var(--cl-surface-muted-4))]'

const inputClass =
  'su-input block box-border min-w-0 w-full rounded-[var(--su-r,var(--r))] border-[1.5px] border-[var(--su-border-em,var(--rule-em))] bg-[var(--su-card,var(--canvas))] px-[14px] py-3 [font-family:var(--su-font,var(--font-sans))] text-[var(--cl-text-lg)] font-medium text-[var(--su-tx1,var(--tp))] outline-none transition-colors duration-150 placeholder:text-[var(--cl-muted-11,var(--tm))] placeholder:font-normal focus:border-[var(--su-tx1,var(--acc))]'

const hintClass =
  'su-field-hint mt-[5px] text-[var(--cl-text-xs)] font-medium text-[var(--su-tx4,var(--tm))]'

export function Field({ className = '', children, ...props }) {
  return (
    <div className={cn('grid gap-2', className)} {...props}>
      {children}
    </div>
  )
}

export function FieldLabel({ children, className = '', ...props }) {
  return (
    <label className={cn(labelClass, className)} {...props}>
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
      className={cn(inputClass, error && 'su-input--error border-[var(--cl-danger-2)]', className)}
    />
  )
})

export const FieldSelect = forwardRef(function FieldSelect({ error = false, className = '', ...props }, ref) {
  return (
    <select
      ref={ref}
      {...props}
      aria-invalid={props['aria-invalid'] ?? (error || undefined)}
      className={cn(fieldClass, error && 'su-input--error border-[var(--cl-danger-2)]', className)}
    />
  )
})

export const FieldTextarea = forwardRef(function FieldTextarea({ error = false, className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      {...props}
      aria-invalid={props['aria-invalid'] ?? (error || undefined)}
      className={cn(areaClass, error && 'su-input--error border-[var(--cl-danger-2)]', className)}
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
    <p className={cn(hintClass, error && 'su-field-hint--error text-[var(--cl-danger-2)]', className)} {...props}>
      {children}
    </p>
  )
}
