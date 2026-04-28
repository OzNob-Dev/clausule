import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    restoreMocks: true,
  },
  resolve: {
    alias: {
      '@auth': fileURLToPath(new URL('./src/auth', import.meta.url)),
      '@account': fileURLToPath(new URL('./src/account', import.meta.url)),
      '@actions': fileURLToPath(new URL('./src/actions', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@brag': fileURLToPath(new URL('./src/app/(protected)/(author)/brag', import.meta.url)),
      '@component-library': fileURLToPath(new URL('./src/component-library', import.meta.url)),
      '@landing': fileURLToPath(new URL('./src/app/(public)/landing', import.meta.url)),
      '@mfa': fileURLToPath(new URL('./src/app/(auth)/mfa', import.meta.url)),
      '@signup': fileURLToPath(new URL('./src/app/(auth)/signup', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/app/api', import.meta.url)),
    },
  },
})
