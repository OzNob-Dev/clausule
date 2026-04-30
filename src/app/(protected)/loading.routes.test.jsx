import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BragLoading from './(author)/brag/loading'
import BragFeedbackLoading from './(author)/brag/feedback/loading'
import BragFeedbackHistoryLoading from './(author)/brag/feedback/history/loading'
import BragLinkedinLoading from './(author)/brag/linkedin/loading'
import BragResumeLoading from './(author)/brag/resume/loading'
import ProfileLoading from './(author)/profile/loading'
import SettingsLoading from '../(protected-mfa-exempt)/(author)/brag/settings/loading'

describe.each([
  ['brag', BragLoading],
  ['feedback', BragFeedbackLoading],
  ['feedback history', BragFeedbackHistoryLoading],
  ['linkedin', BragLinkedinLoading],
  ['resume', BragResumeLoading],
  ['profile', ProfileLoading],
  ['settings', SettingsLoading],
])('%s protected loader', (_, Loading) => {
  it('renders the centered loading overlay', () => {
    render(<Loading />)

    expect(screen.getByRole('heading', { name: /just a moment/i })).toBeInTheDocument()
    expect(screen.queryByText('Loading app')).not.toBeInTheDocument()
  })
})
