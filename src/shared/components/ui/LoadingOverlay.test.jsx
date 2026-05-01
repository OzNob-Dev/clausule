import React from 'react'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LoadingOverlay from './LoadingOverlay'

const dir = dirname(fileURLToPath(import.meta.url))

describe('LoadingOverlay', () => {
  it('renders the loading status and centered copy structure', () => {
    render(<LoadingOverlay />)

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /just a moment/i })).toBeInTheDocument()
  })

  it('loads styles from a first-party CSS file for CSP compatibility', () => {
    const component = readFileSync(join(dir, 'LoadingOverlay.jsx'), 'utf8')
    const css = readFileSync(join(dir, 'LoadingOverlay.css'), 'utf8')

    expect(component).toContain("import './LoadingOverlay.css'")
    expect(component).not.toContain('<style>')
    expect(css).toContain('.loader-copy')
    expect(css).toContain('position: absolute')
    expect(css).toContain('@keyframes dot-rise')
  })
})
