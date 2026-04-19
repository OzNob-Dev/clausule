import crypto from 'node:crypto'

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const STEP_SECONDS = 30

export function generateBase32Secret(byteLength = 20) {
  const bytes = crypto.randomBytes(byteLength)
  let result = ''
  let buffer = 0
  let bitsLeft = 0

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte
    bitsLeft += 8
    while (bitsLeft >= 5) {
      bitsLeft -= 5
      result += BASE32_CHARS[(buffer >> bitsLeft) & 0x1f]
    }
  }

  if (bitsLeft > 0) result += BASE32_CHARS[(buffer << (5 - bitsLeft)) & 0x1f]
  return result
}

export function base32Decode(input) {
  const bytes = []
  let buffer = 0
  let bitsLeft = 0

  for (const char of input.toUpperCase().replace(/=+$/, '')) {
    const value = BASE32_CHARS.indexOf(char)
    if (value === -1) continue
    buffer = (buffer << 5) | value
    bitsLeft += 5
    if (bitsLeft >= 8) {
      bitsLeft -= 8
      bytes.push((buffer >> bitsLeft) & 0xff)
    }
  }

  return Buffer.from(bytes)
}

export function totpCode(secret, counter) {
  const message = Buffer.alloc(8)
  let c = counter
  for (let i = 7; i >= 0; i--) {
    message[i] = c & 0xff
    c = Math.floor(c / 256)
  }

  const hmac = crypto.createHmac('sha1', base32Decode(secret)).update(message).digest()
  const offset = hmac[19] & 0x0f
  const code =
    ((hmac[offset]     & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) <<  8) |
     (hmac[offset + 3] & 0xff)

  return String(code % 1_000_000).padStart(6, '0')
}

export function verifyTotp(secret, code, now = Date.now()) {
  const counter = Math.floor(now / 1000 / STEP_SECONDS)
  return [-1, 0, 1].some((delta) => totpCode(secret, counter + delta) === code)
}
