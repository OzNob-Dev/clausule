export function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value) {
  let formatted = value.replace(/\D/g, '').slice(0, 4)
  if (formatted.length >= 3) {
    formatted = `${formatted.slice(0, 2)} / ${formatted.slice(2)}`
  }
  return formatted
}
