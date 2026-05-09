'use client'
import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import ThemeProvider from '@/components/ThemeProvider'

const authRoutes = ['/login', '/signup', '/forgot-password', '/verify-email']

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (isAuthRoute) {
    return (
      <SessionProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </SessionProvider>
    )
  }

  return (
    <SessionProvider>
      <ThemeProvider>
        <Navbar />
        <main className="lg:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </ThemeProvider>
    </SessionProvider>
  )
}
