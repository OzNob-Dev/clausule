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
    <div className={cn('field flex min-w-0 flex-col gap-[9px]', className)}>
      <label className={cn('field-label text-[var(--cl-text-xs)] font-bold uppercase tracking-[1.5px] text-[var(--cl-surface-muted-9)]', labelClassName)} htmlFor={id}>{label}</label>
      <input
        id={id}
        className={cn('field-input w-full border-0 border-b-[1.5px] border-b-[var(--cl-ink-alpha-18)] bg-transparent px-0 pb-[11px] pt-2 font-serif text-[var(--cl-title-sm)] tracking-[-0.2px] text-[var(--cl-surface-ink-2)] outline-none transition-colors placeholder:font-sans placeholder:text-[var(--cl-text-base)] placeholder:font-normal placeholder:tracking-normal placeholder:text-[var(--cl-surface-muted-12)] focus:border-b-[var(--cl-accent-deep)]', readOnly && 'is-readonly cursor-default bg-transparent text-[var(--cl-muted)] opacity-80', inputClassName)}
        readOnly={readOnly}
        aria-readonly={readOnly || undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint ? <p id={hintId} className={cn('field-hint text-[var(--cl-text-sm)] leading-[1.5] text-[var(--cl-surface-muted-9)]', hintClassName)}>{hint}</p> : null}
    </div>
  )
}
