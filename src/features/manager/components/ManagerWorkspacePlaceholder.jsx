'use client'

import Link from 'next/link'
import { AppShell } from '@features/manager/components/AppShell'
import { ROUTES } from '@shared/utils/routes'

export function ManagerWorkspacePlaceholder({
  title,
  description,
  detail,
  children = null,
  actionHref = ROUTES.profile,
  actionLabel = 'Open profile',
}) {
  return (
    <AppShell>
      <div className="flex min-h-screen flex-col px-8 py-8 max-sm:px-4 max-sm:py-6">
        <div className="mx-auto flex w-full max-w-[52rem] flex-1 flex-col justify-center">
          <div className="rounded-[28px] border border-border bg-canvas p-8 shadow-[0_24px_80px_rgba(26,21,16,0.08)] max-sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-tx-3">Manager workspace</p>
            <h1 className="mt-3 text-[30px] font-black tracking-[-0.9px] text-tx-1 max-sm:text-[24px]">{title}</h1>
            <p className="mt-3 max-w-[44rem] text-[15px] leading-[1.8] text-tx-2">{description}</p>
            {detail && <p className="mt-3 max-w-[44rem] text-[14px] leading-[1.75] text-tx-3">{detail}</p>}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={actionHref}
                className="inline-flex min-h-11 items-center rounded-[var(--r)] bg-acc px-4 py-3 text-[13px] font-bold text-bg-doc no-underline transition-opacity duration-150 hover:opacity-90"
              >
                {actionLabel}
              </Link>
              <p className="text-[12px] font-medium text-tx-3">Live manager records and saved controls will return once these routes are wired to production data.</p>
            </div>
          </div>

          {children && <div className="mx-auto mt-6 w-full max-w-[52rem]">{children}</div>}
        </div>
      </div>
    </AppShell>
  )
}
