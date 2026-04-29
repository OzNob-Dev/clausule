import { cn } from '@shared/utils/cn'

export function SectionCard({
  as: Component = 'div',
  children,
  title,
  meta = null,
  headerEnd = null,
  titleId,
  ariaLabel,
  className = '',
  headerClassName = '',
  titleClassName = '',
  metaClassName = '',
  bodyClassName = '',
  ...props
}) {
  return (
    <Component className={cn(className)} aria-label={ariaLabel || undefined} {...props}>
      <div className={cn(headerClassName)}>
        <span id={titleId} className={cn(titleClassName)}>{title}</span>
        {meta ? <span className={cn(metaClassName)}>{meta}</span> : null}
        {headerEnd}
      </div>
      <div className={cn(bodyClassName)}>
        {children}
      </div>
    </Component>
  )
}
