'use client'
import { SessionProvider } from 'next-auth/react'
import Navbar from '@/Components/Navbar'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <Navbar />
      <main className="lg:ml-64 min-h-screen bg-gray-50">
        {children}
      </main>
    </SessionProvider>
  )
}
