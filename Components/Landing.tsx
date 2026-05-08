'use client'
import Link from 'next/link'
import { FaShieldAlt, FaBolt, FaGlobe, FaChartLine } from 'react-icons/fa'

const features = [
  { icon: FaBolt, title: 'Instant Transfers', description: 'Send money instantly to any SmartBank account with zero fees.' },
  { icon: FaShieldAlt, title: 'Bank-Grade Security', description: 'Your money and data are protected with enterprise-level encryption.' },
  { icon: FaGlobe, title: 'Global Access', description: 'Manage your finances anywhere, anytime with 24/7 online access.' },
  { icon: FaChartLine, title: 'Smart Insights', description: 'Track spending patterns and get personalized financial insights.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">SmartBank</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Banking Made{' '}
              <span className="text-blue-600">Simple</span>
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Experience modern banking with instant transfers, real-time tracking, and enterprise-grade security — all from your browser.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Open an Account
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SmartBank. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
