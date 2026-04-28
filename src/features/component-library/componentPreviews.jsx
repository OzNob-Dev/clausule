'use client'

import { useState } from 'react'
import { Avatar } from '@shared/components/ui/Avatar'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { CategoryDot, CategoryPill } from '@shared/components/ui/CategoryPill'
import { CodeEmail } from '@shared/components/ui/CodeEmail'
import { Field, FieldHint, FieldInput, FieldLabel } from '@shared/components/ui/Field'
import { Link } from '@shared/components/ui/Link'
import { Modal } from '@shared/components/ui/Modal'
import PageLoader from '@shared/components/ui/PageLoader'
import { ThinkingDots } from '@shared/components/ui/ThinkingDots'
import { SsoProviderIcon } from '@shared/components/SsoProviderIcon'

const buttonVariants = ['primary', 'ghost', 'danger', 'confirm']
const buttonSizes = ['sm', 'md', 'lg']
const avatarSizes = ['sm', 'md', 'lg']
const pageLoaderVariants = ['signup', 'auth', 'brag', 'feedback', 'settings', 'profile', 'mfa']
const categoryOptions = ['perf', 'conduct', 'dev']
const providerOptions = ['google', 'microsoft', 'apple']
const avatarPalettes = [
  { label: 'Warm', bg: '#7F351F', fg: '#FAF7F3' },
  { label: 'Forest', bg: '#225F3D', fg: '#FAF7F3' },
  { label: 'Stone', bg: '#4D4035', fg: '#FAF7F3' },
]

function controlClass(active) {
  return active
    ? 'rounded-full border border-acc bg-acc px-3 py-1 text-[12px] font-semibold text-canvas transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc'
    : 'rounded-full border border-rule bg-card px-3 py-1 text-[12px] font-semibold text-ts transition-colors duration-150 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc'
}

export function GenericPreview({ entry }) {
  return (
    <Card tone="elevated" padding="lg" className="bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0.35))]">
      <p className="text-xs uppercase tracking-[0.3em] text-tc">{entry.layer}</p>
      <h3 className="mt-3 font-serif text-2xl text-tp">{entry.displayName}</h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-ts">{entry.note}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Card padding="sm">
          <p className="text-[11px] uppercase tracking-[0.24em] text-tc">Owner</p>
          <p className="mt-2 text-sm font-semibold text-tp">{entry.owner}</p>
        </Card>
        <Card padding="sm">
          <p className="text-[11px] uppercase tracking-[0.24em] text-tc">Preview</p>
          <p className="mt-2 text-sm text-tp">Generic card used when no bespoke playground control is needed.</p>
        </Card>
      </div>
    </Card>
  )
}

export function LinkPreview() {
  return (
    <div className="grid gap-4">
      <Card padding="lg">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/signup" variant="button">Continue with email</Link>
          <Link href="/components">View library</Link>
        </div>
      </Card>
      <p className="text-sm text-ts">Link-like control used for navigation, SSO, and conversion prompts.</p>
    </div>
  )
}

export function FieldPreview() {
  const [error, setError] = useState(true)

  return (
    <div className="grid gap-4">
      <Card padding="lg">
        <div className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="component-library-field">Email address</FieldLabel>
            <FieldInput id="component-library-field" defaultValue="ada@example.com" error={error} />
            <FieldHint error={error}>{error ? 'Enter a valid email address.' : 'Field primitives stay composable.'}</FieldHint>
          </Field>
          <button type="button" className="w-fit text-sm font-semibold text-acc underline underline-offset-4" onClick={() => setError((value) => !value)}>
            Toggle error
          </button>
        </div>
      </Card>
      <p className="text-sm text-ts">Field primitives should stay composable, labeled, and keyboard-safe.</p>
    </div>
  )
}

export function CardPreview({ entry }) {
  return (
    <div className="grid gap-4">
      <Card as="article" tone="elevated" padding="lg">
        <p className="text-[11px] uppercase tracking-[0.24em] text-tc">{entry.displayName}</p>
        <h3 className="mt-2 font-serif text-2xl text-tp">Reusable card surface</h3>
        <p className="mt-2 text-sm leading-6 text-ts">Cards should group content, not hide intent.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-acc-bg px-3 py-1 text-[11px] font-semibold text-acc">Primary</span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-tc">Secondary</span>
        </div>
      </Card>
    </div>
  )
}

export function IconPreview() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        <Card as="span" padding="sm" className="p-0 inline-flex h-14 w-14 items-center justify-center">
          <SsoProviderIcon provider="google" />
        </Card>
        <Card as="span" padding="sm" className="p-0 inline-flex h-14 w-14 items-center justify-center">
          <SsoProviderIcon provider="apple" />
        </Card>
      </div>
      <p className="text-sm text-ts">Icon-only primitives need contrast, sizing, and context to stay readable.</p>
    </div>
  )
}

export function ButtonPreview() {
  const [variant, setVariant] = useState('primary')
  const [size, setSize] = useState('md')

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-sm text-ts">
          <span className="text-[11px] uppercase tracking-[0.24em]">Variant</span>
          <select value={variant} onChange={(e) => setVariant(e.target.value)} className="rounded-xl border border-rule bg-card px-3 py-2 text-sm text-tp focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc">
            {buttonVariants.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-ts">
          <span className="text-[11px] uppercase tracking-[0.24em]">Size</span>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="rounded-xl border border-rule bg-card px-3 py-2 text-sm text-tp focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc">
            {buttonSizes.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant={variant} size={size}>Save changes</Button>
        <Button variant="ghost" size="sm">Secondary action</Button>
      </div>
    </div>
  )
}

export function AvatarPreview() {
  const [size, setSize] = useState('md')
  const [palette, setPalette] = useState(0)
  const swatch = avatarPalettes[palette]

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {avatarSizes.map((option) => (
          <button key={option} type="button" className={controlClass(size === option)} onClick={() => setSize(option)}>
            {option}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {avatarPalettes.map((option, index) => (
          <button key={option.label} type="button" className={controlClass(palette === index)} onClick={() => setPalette(index)}>
            {option.label}
          </button>
        ))}
      </div>
      <Avatar initials="AL" size={size} bg={swatch.bg} color={swatch.fg} />
    </div>
  )
}

export function ModalPreview() {
  const [open, setOpen] = useState(false)

  return (
    <div className="grid gap-4">
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <p className="max-w-lg text-sm leading-6 text-ts">Open the dialog to verify focus trapping, escape handling, and inert background behavior.</p>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm component usage"
        footer={<Button type="button" variant="ghost" onClick={() => setOpen(false)}>Close</Button>}
      >
        <p className="text-sm leading-6 text-tp">The modal preview is live. Keyboard focus should move into the dialog and return when it closes.</p>
      </Modal>
    </div>
  )
}

export function CodeEmailPreview() {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={() => setRevealed((value) => !value)}>{revealed ? 'Hide code' : 'Reveal code'}</Button>
        <span className="text-sm text-ts">Toggle email digits without changing layout.</span>
      </div>
      <CodeEmail to="ada@example.com" code="246810" revealed={revealed} />
    </div>
  )
}

export function CategoryPreview() {
  const [cat, setCat] = useState('perf')
  const [showDot, setShowDot] = useState(true)

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((option) => (
          <button key={option} type="button" className={controlClass(cat === option)} onClick={() => setCat(option)}>
            {option}
          </button>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-ts">
        <input type="checkbox" checked={showDot} onChange={(e) => setShowDot(e.target.checked)} className="h-4 w-4 rounded border-rule text-acc focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc" />
        Show dot
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <CategoryPill cat={cat} showDot={showDot} />
        <CategoryDot cat={cat} />
      </div>
    </div>
  )
}

export function ProviderIconPreview() {
  const [provider, setProvider] = useState('google')

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {providerOptions.map((option) => (
          <button key={option} type="button" className={controlClass(provider === option)} onClick={() => setProvider(option)}>
            {option}
          </button>
        ))}
      </div>
      <Card as="span" padding="sm" className="p-0 inline-flex h-16 w-16 items-center justify-center">
        <SsoProviderIcon provider={provider} />
      </Card>
    </div>
  )
}

export function ThinkingDotsPreview() {
  return (
    <div className="grid gap-3">
      <p className="text-sm text-ts">Motion-safe loading indicator with visible status text nearby.</p>
      <Card padding="sm" className="inline-flex items-center gap-3">
        <ThinkingDots />
        <span className="text-sm font-medium text-tp">Loading component preview</span>
      </Card>
    </div>
  )
}

export function AppShellPreview() {
  return (
    <div className="grid gap-4 rounded-[1.75rem] border border-rule bg-card p-5">
      <div className="rounded-2xl border border-rule bg-nav px-4 py-3 text-sm text-canvas">
        Skip link, rail, and persistent shell chrome stay consistent across protected surfaces.
      </div>
      <div className="grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)]">
        <div className="min-h-24 rounded-2xl border border-rule bg-nav/95 p-3 text-xs text-canvas">Rail</div>
        <Card padding="sm" className="bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(255,255,255,0.35))]">
          <p className="text-xs uppercase tracking-[0.28em] text-tc">Main</p>
          <p className="mt-2 text-sm text-tp">This route runs inside the shared app shell.</p>
        </Card>
      </div>
    </div>
  )
}

export function RailNavPreview() {
  return (
    <div className="grid gap-3">
      <Card as="div" tone="default" className="bg-nav text-canvas">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em]">
          <span>Navigation</span>
          <span>Protected</span>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          <span className="h-8 rounded-xl bg-acc-bg" />
          <span className="h-8 rounded-xl bg-white/5" />
          <span className="h-8 rounded-xl bg-white/5" />
          <span className="h-8 rounded-xl bg-white/5" />
          <span className="h-8 rounded-xl bg-white/5" />
        </div>
      </Card>
      <p className="text-sm text-ts">Primary rail navigation with active and inactive states.</p>
    </div>
  )
}

export function ShellPreview() {
  return <AppShellPreview />
}

export function LoaderPreview() {
  const [variant, setVariant] = useState('brag')

  return (
    <div className="grid gap-4">
      <label className="grid gap-1 text-sm text-ts">
        <span className="text-[11px] uppercase tracking-[0.24em]">Variant</span>
        <select value={variant} onChange={(e) => setVariant(e.target.value)} className="rounded-xl border border-rule bg-card px-3 py-2 text-sm text-tp focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc">
          {pageLoaderVariants.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
      <Card padding="lg">
        <PageLoader variant={variant} />
      </Card>
      <p className="text-sm text-ts">Busy states need visible text alongside motion.</p>
    </div>
  )
}

export function OtpPreview() {
  return (
    <div className="grid gap-4">
      <Card padding="lg">
        <div className="grid gap-3">
          <label className="text-sm font-semibold text-tp">One-time code</label>
          <div className="grid grid-cols-6 gap-2">
            {['2', '4', '6', '8', '1', '0'].map((digit) => (
              <div key={digit} className="flex h-11 items-center justify-center rounded-xl border border-rule bg-canvas text-sm font-semibold text-tp">{digit}</div>
            ))}
          </div>
        </div>
      </Card>
      <p className="text-sm text-ts">OTP rows, secrets, and TOTP setup should preserve keyboard flow.</p>
    </div>
  )
}

export function FormPreview() {
  return (
    <div className="grid gap-4">
      <Card padding="lg">
        <form className="grid gap-4">
          <Field>
            <FieldLabel htmlFor="library-form-email">Email</FieldLabel>
            <FieldInput id="library-form-email" defaultValue="ada@example.com" />
          </Field>
          <button type="button" className="inline-flex w-fit items-center rounded-full bg-acc px-4 py-2 text-sm font-semibold text-canvas">Send code</button>
        </form>
      </Card>
      <p className="text-sm text-ts">Forms should pair labels, feedback, and actions in one readable unit.</p>
    </div>
  )
}

export function PagePreview({ entry }) {
  return (
    <Card as="section" tone="elevated" padding="lg">
      <div className="rounded-2xl border border-rule bg-[linear-gradient(135deg,rgba(201,79,42,0.08),rgba(34,95,61,0.06))] p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-tc">{entry.route}</p>
        <h3 className="mt-2 font-serif text-2xl text-tp">{entry.displayName}</h3>
        <p className="mt-2 text-sm leading-6 text-ts">{entry.note}</p>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Card padding="sm">
          <p className="text-[11px] uppercase tracking-[0.24em] text-tc">Layer</p>
          <p className="mt-2 text-sm font-semibold text-tp">{entry.layer}</p>
        </Card>
        <Card padding="sm">
          <p className="text-[11px] uppercase tracking-[0.24em] text-tc">Owner</p>
          <p className="mt-2 text-sm font-semibold text-tp">{entry.owner}</p>
        </Card>
      </div>
    </Card>
  )
}

export function ComponentPreview({ entry }) {
  switch (entry.previewKind) {
    case 'app-shell':
      return <AppShellPreview />
    case 'avatar':
      return <AvatarPreview />
    case 'button':
      return <ButtonPreview />
    case 'category':
      return <CategoryPreview />
    case 'code-email':
      return <CodeEmailPreview />
    case 'card':
      return <CardPreview entry={entry} />
    case 'dialog':
      return <ModalPreview />
    case 'email':
      return <CodeEmailPreview />
    case 'field':
      return <FieldPreview />
    case 'form':
      return <FormPreview />
    case 'group':
      return <CardPreview entry={entry} />
    case 'icon':
      return <IconPreview />
    case 'link':
      return <LinkPreview />
    case 'loader':
      return <LoaderPreview />
    case 'modal':
      return <ModalPreview />
    case 'provider-icon':
      return <ProviderIconPreview />
    case 'rail-nav':
      return <RailNavPreview />
    case 'notice':
      return <CardPreview entry={entry} />
    case 'otp':
      return <OtpPreview />
    case 'panel':
      return <CardPreview entry={entry} />
    case 'page':
      return <PagePreview entry={entry} />
    case 'shell':
      return <ShellPreview />
    case 'thinking-dots':
      return <ThinkingDotsPreview />
    default:
      return <GenericPreview entry={entry} />
  }
}
