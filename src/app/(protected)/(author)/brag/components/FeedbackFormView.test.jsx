import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FeedbackFormView from './FeedbackFormView'

const noop = vi.fn()

describe('FeedbackFormView', () => {
  it('renders the contact checkbox as an accessible checkbox control', () => {
    render(
      <FeedbackFormView
        userEmail="ada@example.com"
        category="Idea"
        feeling="Just noting"
        subject="Title"
        message="Message"
        improvement="Improve"
        contactOk
        canSend
        sending={false}
        sent={false}
        error=""
        onCategoryChange={noop}
        onFeelingChange={noop}
        onSubjectChange={noop}
        onMessageChange={noop}
        onImprovementChange={noop}
        onContactOkChange={noop}
        onCancel={noop}
        onSend={noop}
      />
    )

    expect(screen.getByRole('checkbox', { name: /the clausule team may contact me about this feedback/i })).toBeChecked()
  })
})
