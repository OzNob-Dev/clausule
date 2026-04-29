import { describe, expect, it } from 'vitest'
import nextConfig from '../next.config.js'

describe('next config security headers', () => {
  it('allows Google Fonts styles and fonts in CSP', async () => {
    const [{ headers }] = await nextConfig.headers()
    const csp = headers.find((header) => header.key === 'Content-Security-Policy')?.value ?? ''

    expect(csp).toContain("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com")
    expect(csp).toContain("style-src-elem 'self' https://fonts.googleapis.com")
    expect(csp).toContain("font-src 'self' https://fonts.gstatic.com")
  })
})
