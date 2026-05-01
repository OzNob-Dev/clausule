'use client'

import { useAuth } from '@auth/context/AuthContext'
import { Button } from '@shared/components/ui/Button'
import { LogoutIcon } from '@shared/components/ui/icon/LogoutIcon'

export default function ClientSignOutButton() {
  const { logout } = useAuth()

  return (
    <Button
      type="button"
      variant="ghost"
      className="sidebar__signout w-full justify-center gap-3 rounded-xl border border-[var(--cl-accent-soft-15)] bg-transparent px-6 py-[14px] font-semibold text-[var(--sidebar-text-strong)] shadow-none transition-[background-color,border-color,transform] duration-200 hover:bg-[var(--sidebar-bg-soft)] hover:border-[var(--sidebar-accent)] hover:opacity-100 hover:-translate-y-px max-[560px]:w-full motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      onClick={logout}
    >
      <LogoutIcon />
      Log out
    </Button>
  )
}
