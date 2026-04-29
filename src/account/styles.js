// Shared Tailwind class constants for account/profile UI
import { cn } from '@shared/utils/cn'

// Layout
export const pageClass    = 'flex w-full min-h-screen bg-[var(--canvas)]'
export const mainClass    = 'flex-1 min-w-0 overflow-y-auto bg-[var(--cl-surface-warm)]'
export const innerClass   = 'max-w-[640px] mx-auto px-8 pt-11 pb-24'

// Typography (mirrors brag-settings-core)
export const headingClass    = 'text-[22px] font-black tracking-[-0.5px] text-[var(--cl-surface-ink)] mb-1.5'
export const subheadingClass = 'text-[13px] text-tm mb-7'
export const dividerClass    = 'h-px bg-gradient-to-r from-[var(--cl-accent-strong)] via-[var(--cl-gold)] to-[var(--cl-brown-alpha-08)] mb-6'

// Card & sections
export const cardClass         = 'bg-[var(--cl-surface-paper)] border border-[var(--cl-border)] rounded-[var(--r2)] px-[22px] py-[18px]'
export const sectionClass      = '[&+&]:mt-5 [&+&]:pt-5 [&+&]:border-t [&+&]:border-[var(--cl-border)]'
export const sectionTitleClass = 'text-[9px] font-bold uppercase tracking-[0.8px] text-tm mb-3'
export const fieldsClass       = 'grid grid-cols-2 gap-[14px] max-[680px]:grid-cols-1'

// Form controls
export const labelClass = 'block text-xs font-bold text-[var(--cl-surface-ink)] mb-1.5'
export const inputClass = 'block box-border min-w-0 w-full min-h-[42px] px-3 py-2.5 rounded-[var(--r)] border-[1.5px] border-[var(--cl-border-2)] bg-transparent text-[var(--cl-surface-ink)] font-[inherit] focus-visible:outline-none focus-visible:border-[var(--cl-surface-ink)] focus-visible:shadow-[0_0_0_3px_var(--cl-brown-alpha-08)]'
export const helpClass  = 'text-xs leading-relaxed text-tm mt-2'

// Alerts
export const alertClass        = 'mt-4 rounded-[14px] px-[14px] py-3 text-xs leading-[1.55]'
export const alertErrorClass   = 'bg-[var(--cl-danger-soft-2)] text-[var(--cl-danger-4)]'
export const alertSuccessClass = 'bg-[var(--cl-success-soft-3)] text-[var(--cl-success)]'

// Buttons
export const btnClass        = 'rounded-[var(--r)] px-4 py-[11px] font-sans text-[13px] font-bold transition-[background-color,border-color,opacity,color] duration-150 cursor-pointer disabled:cursor-default disabled:opacity-45'
export const btnGhostClass   = 'border-[1.5px] border-[var(--cl-border-4)] bg-transparent text-tm hover:enabled:border-[var(--cl-border-6)] hover:enabled:text-tp'
export const btnPrimaryClass = 'border-none bg-acc text-[var(--cl-surface-paper)] hover:enabled:opacity-90'
export const actionsClass    = 'mt-5 pt-[18px] border-t border-[var(--cl-border)] flex justify-end gap-2.5 max-[680px]:flex-col-reverse'
export const actionsBtnClass = 'max-[680px]:w-full'

// Modal content
export const modalClass        = 'grid gap-4'
export const modalCopyClass    = 'text-xs leading-relaxed text-tm'
export const changeListClass   = 'grid grid-cols-[auto_1fr] gap-x-[14px] gap-y-2 m-0 p-[14px] rounded-2xl bg-[var(--cl-brown-alpha-05)] max-[680px]:grid-cols-1'
export const changeListDtClass = 'text-[11px] font-extrabold uppercase tracking-[0.14em] text-tm'
export const changeListDdClass = 'm-0 text-xs font-bold text-tp text-right max-[680px]:text-left'
export const verifyClass       = 'grid gap-2.5'
export const verifyTitleClass  = 'text-[13px] font-extrabold text-tp'
export const verifyMetaClass   = 'min-h-[18px] text-xs leading-relaxed text-tm'
export const warningBaseClass  = 'grid gap-2.5 p-[14px] rounded-2xl'
export const warningTitleClass = 'text-[13px] font-extrabold text-tp'
export const checkClass        = 'flex items-center gap-2.5 text-xs font-bold text-tp'

export function getFieldClass(full = false) {
  return cn('min-w-0', full && 'col-span-full')
}
