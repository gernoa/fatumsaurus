import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Fatumsaurus',
  description: 'Tu destino, tu orden',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable} suppressHydrationWarning>
      <body className="antialiased min-h-full">
        {children}
        <Toaster
          richColors
          position="bottom-right"
          toastOptions={{
            style: { fontFamily: 'var(--font-poppins), system-ui, sans-serif' },
          }}
        />
      </body>
    </html>
  )
}
