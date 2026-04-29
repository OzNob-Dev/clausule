import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

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

function parseArgs(argv) {
  const args = { apply: false, provider: 'google', email: '' }

  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i]
    if (part === '--apply') args.apply = true
    else if (part === '--email') args.email = String(argv[i + 1] ?? '').trim().toLowerCase(), i += 1
    else if (part === '--provider') args.provider = String(argv[i + 1] ?? '').trim().toLowerCase(), i += 1
  }

  return args
}

function usage() {
  console.error('Usage: node scripts/fix-auth-provider.js --email ada@example.com --provider google [--apply]')
  process.exit(1)
}

function providerFromAuthUser(user) {
  const provider = user?.app_metadata?.provider
  if (provider && provider !== 'email') return provider
  return user?.identities?.find((identity) => identity?.provider && identity.provider !== 'email')?.provider ?? null
}

function profileQuery(email) {
  return new URLSearchParams({
    email: `eq.${email}`,
    select: 'id,email,totp_secret',
    limit: '1',
  }).toString()
}

function normalizeProvider(value) {
  if (!value || value === 'none' || value === 'null' || value === 'clear') return null
  return value
}

function printAuthSnapshot(label, profile, user) {
  const derived = providerFromAuthUser(user)
  const identities = Array.isArray(user?.identities) ? user.identities.map((identity) => identity?.provider).filter(Boolean) : []
  console.log(label)
  console.log(`profile_id: ${profile.id}`)
  console.log(`email: ${profile.email}`)
  console.log(`totp_configured: ${Boolean(profile.totp_secret)}`)
  console.log(`app_metadata.provider: ${user?.app_metadata?.provider ?? '(unset)'}`)
  console.log(`derived_provider: ${derived ?? '(none)'}`)
  console.log(`identities: ${identities.length ? identities.join(', ') : '(none)'}`)
}

async function main() {
  loadLocalEnv()

  const args = parseArgs(process.argv.slice(2))
  if (!args.email) usage()

  const { select, getAuthUser, updateAuthUser } = await import('../src/app/api/_lib/supabase.js')
  const { data: profiles, error: profileError } = await select('profiles', profileQuery(args.email))
  if (profileError) throw profileError

  const profile = Array.isArray(profiles) ? profiles[0] ?? null : profiles ?? null
  if (!profile?.id) throw new Error(`No profile found for ${args.email}`)

  const before = await getAuthUser(profile.id)
  if (before.error) throw before.error
  const beforeUser = before.data?.user ?? before.data
  const nextProvider = normalizeProvider(args.provider)

  printAuthSnapshot('Current auth linkage', profile, beforeUser)
  console.log(`requested_provider: ${nextProvider ?? '(clear to email/no-sso)'}`)

  if (!args.apply) {
    console.log('Dry run only. Re-run with --apply to write app_metadata.provider.')
    return
  }

  const nextAppMetadata = { ...(beforeUser?.app_metadata ?? {}) }
  if (nextProvider) nextAppMetadata.provider = nextProvider
  else delete nextAppMetadata.provider

  const updateResult = await updateAuthUser(profile.id, { app_metadata: nextAppMetadata })
  if (updateResult.error) throw updateResult.error

  const after = await getAuthUser(profile.id)
  if (after.error) throw after.error
  const afterUser = after.data?.user ?? after.data

  console.log('')
  printAuthSnapshot('Updated auth linkage', profile, afterUser)
  console.log('Note: this only rewrites app_metadata.provider. Supabase identities are not modified.')
}

await main().catch((error) => {
  console.error('Failed to update auth provider link.')
  if (error?.code) console.error(`code: ${error.code}`)
  if (error?.message) console.error(`message: ${error.message}`)
  if (error?.details) console.error(`details: ${error.details}`)
  if (error?.hint) console.error(`hint: ${error.hint}`)
  process.exit(1)
})
