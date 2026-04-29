import { cn } from '@shared/utils/cn'

export function ProfileField({
  id,
  label,
  hint,
  className = '',
  inputClassName = '',
  labelClassName = '',
  hintClassName = '',
  readOnly = false,
  ...props
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const describedBy = [props['aria-describedby'], hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('field', className)}>
      <label className={cn('field-label', labelClassName)} htmlFor={id}>{label}</label>
      <input
        id={id}
        className={cn('field-input', readOnly && 'is-readonly', inputClassName)}
        readOnly={readOnly}
        aria-readonly={readOnly || undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint ? <p id={hintId} className={cn('field-hint', hintClassName)}>{hint}</p> : null}
    </div>
  )
}
