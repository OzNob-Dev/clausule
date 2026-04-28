/**
 * Format an Australian mobile number as user types.
 * Local:  04XX XXX XXX
 * Intl:   +61 4XX XXX XXX
 */
export function formatMobile(raw) {
  const hasPlus = raw.startsWith('+')
  const digits = raw.replace(/\D/g, '')

  if (!digits) return hasPlus ? '+' : ''

  if (hasPlus && digits.startsWith('61')) {
    const d = digits.slice(2)
    let out = '+61'
    if (d.length > 0) out += ' ' + d.slice(0, 3)
    if (d.length > 3) out += ' ' + d.slice(3, 6)
    if (d.length > 6) out += ' ' + d.slice(6, 9)
    return out
  }

  if (!hasPlus && digits.startsWith('0')) {
    let out = digits.slice(0, 4)
    if (digits.length > 4) out += ' ' + digits.slice(4, 7)
    if (digits.length > 7) out += ' ' + digits.slice(7, 10)
    return out
  }

  return hasPlus ? '+' + digits : digits
}
