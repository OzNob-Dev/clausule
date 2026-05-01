import { QueryProvider } from '@shared/providers/QueryProvider'
import '@shared/styles/tailwind.css'

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

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
