import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | SmartBank',
  description: 'The page you are looking for does not exist or has been moved.',
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors">
      <section className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">404</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
          The page you are looking for does not exist or has been moved. 
          Please check the URL or navigate back to a known page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Go Home
          </Link>
         
        </div>
      </section>
    </main>
  )
}
