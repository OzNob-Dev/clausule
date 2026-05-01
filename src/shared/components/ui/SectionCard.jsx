import { cn } from '@shared/utils/cn'

export function SectionCard({
  as: Component = 'div',
  children,
  title,
  meta = null,
  headerEnd = null,
  titleId,
  ariaLabel,
  className = 'card',
  headerClassName = 'card-header',
  titleClassName = '',
  metaClassName = '',
  bodyClassName = '',
  ...props
}) {
  return (
    <Component className={cn('card overflow-hidden rounded-[16px] border-[0.5px] border-[rgba(28,26,23,0.1)] bg-[var(--cl-surface-white)]', className)} aria-label={ariaLabel || undefined} {...props}>
      <div className={cn('card-header flex items-center justify-between gap-4 bg-[var(--cl-surface-ink-2)] px-8 py-5', headerClassName)}>
        <span id={titleId} className={cn('bss-card-head-title text-[var(--cl-surface-muted-15)] [font-family:var(--cl-font-serif)] text-[var(--cl-title-lg)] font-normal tracking-[-0.02em]', titleClassName)}>{title}</span>
        {meta ? <span className={cn('bss-card-head-meta whitespace-nowrap text-[var(--cl-surface-muted-7)] text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.16em]', metaClassName)}>{meta}</span> : null}
        {headerEnd}
      </div>
      <div className={cn(bodyClassName)}>
        {children}
      </div>
    </Component>
  )
}
