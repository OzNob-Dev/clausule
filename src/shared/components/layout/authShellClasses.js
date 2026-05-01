export const authShellRootClassName = [
  'su-shell-wrap su-page',
  'flex min-h-screen w-full items-center justify-center p-6 max-[640px]:p-0',
  'text-[var(--su-tx1)] [font-family:var(--su-font,var(--cl-font-sans))]',
  '[--su-canvas:var(--cl-surface-warm)] [--su-card:var(--cl-surface-paper-2)] [--su-panel:var(--cl-surface-muted-17)]',
  '[--su-tx1:var(--cl-surface-ink-3)] [--su-tx2:var(--cl-ink-2)] [--su-tx3:var(--cl-surface-muted-4)] [--su-tx4:var(--cl-surface-muted-8)]',
  '[--su-acc:var(--cl-accent)] [--su-acc-dk:var(--cl-accent-muted)] [--su-acc-bg:var(--cl-accent-soft-3)]',
  '[--su-border:var(--cl-border-dark)] [--su-border-em:var(--cl-border-dark-4)]',
  '[--su-r:var(--cl-radius-md)] [--su-r2:var(--cl-radius-2xl)] [--su-font:var(--cl-font-sans)]',
  'bg-[var(--cl-surface-warm)]',
  'bg-[repeating-linear-gradient(to_bottom,transparent,transparent_47px,var(--cl-rule-dark)_47px,var(--cl-rule-dark)_48px)]',
].join(' ')

export const authShellFrameClassName = [
  'su-shell',
  'relative z-[1] flex w-[780px] max-w-full overflow-hidden rounded-[var(--cl-radius-2xl)] border border-[var(--cl-border-dark-4)]',
  'max-[640px]:flex-col',
].join(' ')

export const authShellRightClassName = [
  'su-shell-right su-page',
  'flex min-w-0 flex-1 flex-col justify-start bg-[var(--cl-surface-paper-2)] px-9 py-10',
  'max-[640px]:px-5 max-[640px]:pb-10 max-[640px]:pt-8',
].join(' ')

export const authShellNarrowClassName = 'su-narrow w-full max-w-[900px]'

export const authStepHeadingClassName = 'su-step-heading mb-1.5 text-[30px] font-black tracking-[-0.8px] text-[var(--su-tx1)]'

export const authStepSubClassName = 'su-step-sub text-[var(--cl-text-base)] leading-[1.65] text-[var(--su-tx3)]'

export const authSigninNoteClassName = 'su-shell-signin-note text-center text-[var(--cl-text-xs)] leading-[1.6] text-[var(--cl-surface-muted-8)]'

export const authPanelSummaryClassName = 'su-panel-summary flex flex-col gap-3.5'
