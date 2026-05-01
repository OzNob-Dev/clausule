export function maskEmail(email) {
  const [name = '', domain = ''] = String(email).split('@')
  if (!name || !domain) return '**'
  return `${name.length <= 2 ? name[0] : name.slice(0, 2)}***@${domain}`
}
