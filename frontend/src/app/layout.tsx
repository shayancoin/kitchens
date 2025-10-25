import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  title: 'Vector Institute AI Template',
  description: 'Vector Institute AI Engineering Template',
  icons: {
    icon: '/favicon.ico',
  },
}

/**
 * Defines the application's root HTML layout, applies global fonts, and wraps page content with app providers.
 *
 * @param children - The page content to render inside the application's body.
 * @returns The root HTML structure (<html> and <body>) with Inter and Orbitron fonts applied and `children` wrapped by the Providers component.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${orbitron.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}