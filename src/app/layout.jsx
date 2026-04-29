import { QueryProvider } from '@shared/providers/QueryProvider'
import DevAccessGate from '@shared/components/layout/DevAccessGate'
import '@shared/styles/globals.css'

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
        <DevAccessGate>
          <QueryProvider>{children}</QueryProvider>
        </DevAccessGate>
      </body>
    </html>
  )
}
