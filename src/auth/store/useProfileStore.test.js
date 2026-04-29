import { beforeEach, describe, expect, it } from 'vitest'
import { useProfileStore } from './useProfileStore.js'

describe('useProfileStore', () => {
  beforeEach(() => {
    useProfileStore.getState().clearProfile()
  })

  it('updates and clears profile state', () => {
    const store = useProfileStore.getState()
    store.setUser({ id: 'user-1', email: 'ada@example.com', role: 'employee' })
    store.updateUser({ email: 'new@example.com' })
    store.setProfile({ firstName: 'Ada' })
    store.setSecurity({ ssoConfigured: true })

    expect(useProfileStore.getState().user.email).toBe('new@example.com')
    expect(useProfileStore.getState().profile.firstName).toBe('Ada')
    expect(useProfileStore.getState().security.ssoConfigured).toBe(true)
    expect(useProfileStore.getState().hasSecuritySnapshot).toBe(true)

    store.clearProfile()
    expect(useProfileStore.getState().user).toBeNull()
    expect(useProfileStore.getState().profile.email).toBe('')
  })
})
