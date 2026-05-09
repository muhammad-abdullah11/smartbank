'use client'
import { FaSun, FaMoon } from 'react-icons/fa'
import { useTheme } from '@/components/ThemeProvider'

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="max-w-md mx-auto m-12 bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 space-y-6 transition-colors">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>

      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {theme === 'dark' ? 'Dark mode is active' : 'Light mode is active'}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full bg-gray-300 dark:bg-blue-600 transition-colors"
            aria-label="Toggle theme"
          >
            <span className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform dark:translate-x-7">
              {theme === 'dark' ? (
                <FaMoon className="w-3 h-3 text-blue-600" />
              ) : (
                <FaSun className="w-3 h-3 text-amber-500" />
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
