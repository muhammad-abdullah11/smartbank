'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { FaHome, FaHistory, FaUser, FaCog, FaCreditCard, FaMoneyBillWave, FaExchangeAlt, FaFileInvoiceDollar, FaBars, FaTimes } from 'react-icons/fa'

const navLinks = [
  { href: '/', label: 'Home', icon: FaHome },
  { href: '/transactions', label: 'History', icon: FaHistory },
  { href: '/transfer', label: 'Transfer', icon: FaExchangeAlt },
  { href: '/cards', label: 'Cards', icon: FaCreditCard },
  { href: '/loans', label: 'Loans', icon: FaMoneyBillWave },
  { href: '/bills', label: 'Bills', icon: FaFileInvoiceDollar },
  { href: '/profile', label: 'Profile', icon: FaUser },
  { href: '/settings', label: 'Settings', icon: FaCog },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <main>
        {!mobileOpen &&(
            <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-700"
            aria-label="Open menu"
            >
        <FaBars className="w-5 h-5" />
      </button>
    )}

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <nav className="relative w-64 bg-white h-full shadow-lg flex flex-col p-4">
            <div className="mb-8 px-4 py-3 flex items-center justify-between">
              <h1 className="text-xl font-bold text-blue-600">SmartBank</h1>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <ul className="flex-1 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                const Icon = link.icon
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setMobileOpen(false)
                  signOut({ callbackUrl: '/login' })
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <span>Log out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:fixed lg:left-0 lg:top-0 lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-sm">
        <div className="flex flex-col h-full p-4">
          <div className="mb-8 px-4 py-3">
            <h1 className="text-xl font-bold text-blue-600">SmartBank</h1>
          </div>

          <ul className="flex-1 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <span>Log out</span>
            </button>
          </div>
        </div>
      </nav>
    </main>
  )
}
