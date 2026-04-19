export default function SsoProviderIcon({ provider }) {
  if (provider === 'google') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.77h5.47a4.67 4.67 0 0 1-2.03 3.07v2.55h3.28c1.92-1.77 3.03-4.38 3.03-7.39z" fill="#4285F4"/>
        <path d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.23-2.51c-.9.6-2.04.96-3.39.96-2.6 0-4.81-1.76-5.6-4.13H1.07v2.6A9.99 9.99 0 0 0 10 20z" fill="#34A853"/>
        <path d="M4.4 11.89A6.01 6.01 0 0 1 4.08 10c0-.65.11-1.29.32-1.89V5.51H1.07A10 10 0 0 0 0 10c0 1.61.38 3.14 1.07 4.49l3.33-2.6z" fill="#FBBC05"/>
        <path d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.86-2.87C14.95.99 12.7 0 10 0A9.99 9.99 0 0 0 1.07 5.51l3.33 2.6C5.19 5.74 7.4 3.98 10 3.98z" fill="#EA4335"/>
      </svg>
    )
  }

  if (provider === 'microsoft') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="8.5" height="8.5" fill="#F25022"/>
        <rect x="10.5" y="1" width="8.5" height="8.5" fill="#7FBA00"/>
        <rect x="1" y="10.5" width="8.5" height="8.5" fill="#00A4EF"/>
        <rect x="10.5" y="10.5" width="8.5" height="8.5" fill="#FFB900"/>
      </svg>
    )
  }

  if (provider === 'apple') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M13.4 1c.1 1-.3 2-1 2.8-.6.7-1.6 1.3-2.6 1.2-.1-1 .4-2 1-2.7C11.5 1.6 12.5 1.1 13.4 1zm3.4 11.4c.5 1 .7 1.5.7 1.5-.4.1-2 .8-2 2.8 0 2.2 1.9 3 1.9 3s-1.3 3.3-3.1 3.3c-.9 0-1.5-.6-2.4-.6-.9 0-1.7.6-2.4.6-1.7 0-3.8-3.1-3.8-7.1 0-3.8 2.3-5.8 4.5-5.8.9 0 1.7.6 2.3.6.6 0 1.5-.7 2.6-.7 1.1 0 2.4.6 3.1 1.9l.1-.1c-1-.6-1.7-1.7-1.7-2.9 0-1.5.9-2.7 2.2-3.3z" fill="#1A1510"/>
      </svg>
    )
  }

  return null
}
