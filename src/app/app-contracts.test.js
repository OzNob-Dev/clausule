import { describe, expect, it, vi } from 'vitest'

vi.mock('next/font/google', () => ({
  DM_Sans: () => ({ variable: 'dm-sans' }),
  DM_Serif_Display: () => ({ variable: 'dm-serif' }),
}))

const routeModules = import.meta.glob('./api/**/route.js', { eager: true })
const pageModules = import.meta.glob('./**/{page,layout,not-found}.jsx', { eager: true })

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

describe('Next app module contracts', () => {
  it.each(Object.entries(routeModules))('%s exports at least one route handler', (path, mod) => {
    expect(METHODS.some((method) => typeof mod[method] === 'function'), path).toBe(true)
  })

  it.each(Object.entries(pageModules))('%s exports a React component by default', (path, mod) => {
    expect(typeof mod.default, path).toBe('function')
  })
})
