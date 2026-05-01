'use client'

import { useAuth } from '@auth/context/AuthContext'
import { Button } from '@shared/components/ui/Button'
import { LogoutIcon } from '@shared/components/ui/icon/LogoutIcon'

export default function ClientSignOutButton() {
  const { logout } = useAuth()

  return (
    <Button type="button" variant="ghost" className="sidebar__signout" onClick={logout}>
      <LogoutIcon />
      Log out
    </Button>
  )
}
