import type { ReactNode } from 'react'
import { Cairo } from 'next/font/google'
import { AdminLocaleProvider } from '@/components/admin-locale-provider'
import { AdminSessionGuard } from '@/components/admin-session-guard'
import '../globals.css'

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata = {
  title: 'BAB Admin',
  robots: 'noindex',
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cairo.variable}>
      <body className="min-h-screen bg-muted text-navy antialiased">
        <AdminLocaleProvider>
          <AdminSessionGuard>{children}</AdminSessionGuard>
        </AdminLocaleProvider>
      </body>
    </html>
  )
}
