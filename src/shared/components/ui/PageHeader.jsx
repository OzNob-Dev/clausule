'use client'
export default function PageHeader({
  className,
  eyebrow,
  eyebrowAriaHidden = false,
  eyebrowClassName,
  title,
  titleAs: TitleTag = 'h1',
  titleClassName,
  titleId,
  description,
  descriptionClassName,
}) {
  return (
    <header className={className}>
      {eyebrow ? <p className={eyebrowClassName} aria-hidden={eyebrowAriaHidden ? true : undefined}>{eyebrow}</p> : null}
      <TitleTag id={titleId} className={titleClassName}>{title}</TitleTag>
      {description ? <p className={descriptionClassName}>{description}</p> : null}
    </header>
  )
}
