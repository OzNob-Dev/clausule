import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useProfileForm } from './useProfileForm'

const PROFILE = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  mobile: '0400000000',
  jobTitle: 'Staff Engineer',
  department: 'Platform',
}

describe('useProfileForm', () => {
  it('does not clobber unsaved edits when profile data refreshes in the background', () => {
    const { result, rerender } = renderHook(({ profile }) => useProfileForm(profile), {
      initialProps: { profile: PROFILE },
    })

    act(() => {
      result.current.setForm((current) => ({ ...current, firstName: 'Grace' }))
    })

    rerender({
      profile: {
        ...PROFILE,
        department: 'Security',
      },
    })

    expect(result.current.form.firstName).toBe('Grace')
    expect(result.current.form.department).toBe('Platform')
    expect(result.current.dirty).toBe(true)
  })
})
