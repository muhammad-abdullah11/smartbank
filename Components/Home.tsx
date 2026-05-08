'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FaExchangeAlt, FaChartLine, FaShieldAlt, FaUser, FaCreditCard } from 'react-icons/fa'

const bankingFeatures = [
  '24/7 Online Banking Access',
  'Real-time Transaction Notifications',
  'Secure Fund Transfers',
  'Digital Statements',
  'Mobile Check Deposit',
]

const securityFeatures = [
  'Bank-level Encryption',
  'Two-Factor Authentication',
  'Fraud Monitoring',
  'FDIC Insured up to $250,000',
  'Secure Password Protection',
]

export default function Home() {
  const { data: session, status } = useSession()
  const loading = status === 'loading'

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <section className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-32" />
                </div>
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded w-40 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(j => (
                      <div key={j} className="h-4 bg-gray-200 rounded w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    )
  }

  const user = session?.user

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16 md:p-4 sm:p-6 lg:p-8">
      <section className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user?.name || 'User'}</h1>
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-8">
          <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FaCreditCard className="text-blue-600" />
              <p className="text-xs md:text-sm text-gray-600">Account Number</p>
            </div>
            <p className="text-lg md:text-xl font-bold text-gray-900">{user?.accountNumber || 'N/A'}</p>
          </div>
          
          <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FaUser className="text-blue-600" />
              <p className="text-xs md:text-sm text-gray-600">Balance</p>
            </div>
            <p className="text-lg md:text-xl font-bold text-green-600">RS {(user?.balance || 0).toFixed(2)}</p>
          </div>
          
          <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FaShieldAlt className="text-blue-600" />
              <p className="text-xs md:text-sm text-gray-600">Account Type</p>
            </div>
            <p className="text-lg md:text-xl font-bold text-gray-900 capitalize">{user?.accountType || 'N/A'}</p>
          </div>
        </section>

        <button className="mb-8">
          <Link
            href="/transfer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FaExchangeAlt />
            Send Money
          </Link>
        </button>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FaChartLine className="text-xl md:text-2xl text-blue-600" />
              <h2 className="text-base md:text-lg font-bold text-gray-900">Smart Banking Features</h2>
            </div>
            <ul className="space-y-2 text-gray-700">
              {bankingFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-xs md:text-sm">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-xl md:text-2xl text-blue-600" />
              <h2 className="text-base md:text-lg font-bold text-gray-900">Security & Protection</h2>
            </div>
            <ul className="space-y-2 text-gray-700">
              {securityFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-xs md:text-sm">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </main>
  )
}
