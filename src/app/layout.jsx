import { QueryProvider } from '@shared/providers/QueryProvider'
import '@shared/styles/globals.css'
import { Analytics } from '@vercel/analytics/next'

export const metadata = {
  title: 'Clausule',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
