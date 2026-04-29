import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Layout from './layout'

describe('layout', () => {
  it('wraps content in the shared authenticated shell', () => {
    render(
      <Layout mainClassName="page-enter demo" innerClassName="demo-inner" ariaLabelledby="demo-title">
        <h1 id="demo-title">Demo</h1>
      </Layout>
    )

    expect(screen.getByRole('main', { name: 'Demo' })).toHaveClass('be-main', 'page-enter', 'demo')
    expect(screen.getByText('Demo').parentElement).toHaveClass('be-inner', 'demo-inner')
  })
})
