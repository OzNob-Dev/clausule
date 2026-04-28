import crypto from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { exchangeSsoCode, resetAppleKeysCacheForTest } from './ssoProviders.js'

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function signJwt({ header, payload, privateKey }) {
  const encodedHeader = base64urlJson(header)
  const encodedPayload = base64urlJson(payload)
  const data = `${encodedHeader}.${encodedPayload}`
  const signature = crypto.sign(
    'sha256',
    Buffer.from(data),
    { key: privateKey, dsaEncoding: 'ieee-p1363' }
  ).toString('base64url')

  return `${data}.${signature}`
}

describe('ssoProviders Apple exchange', () => {
  let clientSecretKey
  let appleSigningKey
  let appleJwk

  beforeEach(() => {
    vi.clearAllMocks()
    resetAppleKeysCacheForTest()

    clientSecretKey = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
    appleSigningKey = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
    appleJwk = {
      ...appleSigningKey.publicKey.export({ format: 'jwk' }),
      kid: 'apple-signing-key',
      use: 'sig',
      alg: 'ES256',
    }

    process.env.APPLE_CLIENT_ID = 'com.clausule.web'
    process.env.APPLE_TEAM_ID = 'TEAM123456'
    process.env.APPLE_KEY_ID = 'CLIENTKEY1'
    process.env.APPLE_PRIVATE_KEY = clientSecretKey.privateKey.export({ format: 'pem', type: 'pkcs8' })

    global.fetch = vi.fn()
  })

  it('verifies the Apple identity token before trusting the email claim', async () => {
    const now = Math.floor(Date.now() / 1000)
    const idToken = signJwt({
      header: { alg: 'ES256', kid: 'apple-signing-key' },
      payload: {
        iss: 'https://appleid.apple.com',
        aud: 'com.clausule.web',
        exp: now + 300,
        sub: 'apple-user-1',
        email: 'Ada@Example.com',
        email_verified: true,
      },
      privateKey: appleSigningKey.privateKey,
    })

    global.fetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ id_token: idToken }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ keys: [appleJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    const result = await exchangeSsoCode({
      provider: 'apple',
      code: 'code-1',
      codeVerifier: 'verifier-1',
      redirectUri: 'https://app.example.com/api/auth/sso/apple/callback',
      appleUser: { name: { firstName: 'Ada', lastName: 'Lovelace' } },
    })

    expect(result).toEqual({
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      provider: 'apple',
      providerId: 'apple-user-1',
    })
  })

  it('rejects Apple identity tokens with invalid claims', async () => {
    const now = Math.floor(Date.now() / 1000)
    const idToken = signJwt({
      header: { alg: 'ES256', kid: 'apple-signing-key' },
      payload: {
        iss: 'https://issuer.example.com',
        aud: 'com.clausule.web',
        exp: now + 300,
        sub: 'apple-user-2',
        email: 'ada@example.com',
        email_verified: true,
      },
      privateKey: appleSigningKey.privateKey,
    })

    global.fetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ id_token: idToken }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ keys: [appleJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    await expect(exchangeSsoCode({
      provider: 'apple',
      code: 'code-2',
      codeVerifier: 'verifier-2',
      redirectUri: 'https://app.example.com/api/auth/sso/apple/callback',
      appleUser: null,
    })).rejects.toThrow('issuer invalid')
  })
})
