import LinkPrimitive from 'next/link'
import { cn } from '@shared/utils/cn'
import './Link.css'
const variantStyles = {
  inline: 'text-acc underline underline-offset-4 decoration-2 transition-colors hover:text-acc/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc',
  button: 'inline-flex items-center justify-center rounded-[var(--r)] border border-acc bg-acc px-4 py-2 text-sm font-semibold text-canvas no-underline transition-opacity duration-150 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc',
  subtle: 'text-ts underline underline-offset-4 transition-colors hover:text-tp focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc',
}

function isExternalHref(href) {
  return typeof href === 'string' && /^(https?:|mailto:|tel:)/i.test(href)
}

export function Link({ href, external = false, variant = 'inline', className = '', children, ...props }) {
  const resolvedExternal = external || isExternalHref(href)
  const classes = cn(variantStyles[variant] ?? variantStyles.inline, className)

  if (resolvedExternal) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <LinkPrimitive href={href} className={classes} {...props}>
      {children}
    </LinkPrimitive>
  )
}
