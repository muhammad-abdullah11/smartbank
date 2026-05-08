'use client'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4 transition-colors">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-4xl font-bold text-red-600 dark:text-red-400">!</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Something Went Wrong</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Try Again
          </button>
          <a
            href="/login"
            className="px-6 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Back to Login
          </a>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
