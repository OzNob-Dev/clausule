import crypto from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

function isoAfterMinutes(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match
    if (process.env[key] !== undefined) continue

    const value = rawValue.startsWith('"') && rawValue.endsWith('"')
      ? rawValue.slice(1, -1)
      : rawValue.startsWith("'") && rawValue.endsWith("'")
        ? rawValue.slice(1, -1)
        : rawValue

    process.env[key] = value
  }
}

function loadLocalEnv() {
  const root = path.resolve(new URL('..', import.meta.url).pathname)
  loadEnvFile(path.join(root, '.env'))
  loadEnvFile(path.join(root, '.env.local'))
}

function printError(error) {
  console.error('create_sso_auth_state RPC failed.')
  if (error?.code) console.error(`code: ${error.code}`)
  if (error?.message) console.error(`message: ${error.message}`)
  if (error?.details) console.error(`details: ${error.details}`)
  if (error?.hint) console.error(`hint: ${error.hint}`)
}

async function main() {
  loadLocalEnv()
  const { rpc } = await import('../src/app/api/_lib/supabase.js')

  const state = `verify-${crypto.randomBytes(8).toString('hex')}`
  const payload = {
    p_state: state,
    p_provider: 'google',
    p_code_verifier: crypto.randomBytes(32).toString('base64url'),
    p_redirect_origin: process.env.SSO_REDIRECT_ORIGIN || 'http://localhost:3000',
    p_expires_at: isoAfterMinutes(5),
  }

  const { data, error } = await rpc('create_sso_auth_state', payload, { expectRows: 'single' })

  if (error) {
    printError(error)
    process.exit(1)
  }

  const row = Array.isArray(data) ? data[0] ?? null : data
  console.log('create_sso_auth_state RPC ok.')
  console.log(`state: ${row?.state ?? state}`)
  console.log(`provider: ${payload.p_provider}`)
  console.log(`redirect_origin: ${payload.p_redirect_origin}`)
}

await main().catch((error) => {
  printError(error)
  process.exit(1)
})
