import { cn } from '@shared/utils/cn'

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

export function FieldInput({ error = false, className = '', ...props }) {
  return (
    <input
      {...props}
      aria-invalid={props['aria-invalid'] ?? (error || undefined)}
      className={cn('su-input', error && 'su-input--error', className)}
    />
  )
}

export function FieldHint({ error = false, className = '', children, ...props }) {
  return (
    <p className={cn('su-field-hint', error && 'su-field-hint--error', className)} {...props}>
      {children}
    </p>
  )
}
