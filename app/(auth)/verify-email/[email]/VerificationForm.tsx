'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter, useParams } from 'next/navigation'

export default function VerificationForm() {
  const router = useRouter()
  const params = useParams()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (params.email) {
      const decodedEmail = decodeURIComponent(params.email as string)
      setEmail(decodedEmail)
    }
  }, [params.email])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById('otp-' + (index + 1))
      if (nextInput) nextInput.focus()
    }

    if (touched && value) {
      validateOtp(newOtp.join(''))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById('otp-' + (index - 1))
      if (prevInput) prevInput.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split('').forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit
    })
    setOtp(newOtp)
    
    const nextIndex = Math.min(pastedData.length, 5)
    const nextInput = document.getElementById('otp-' + nextIndex)
    if (nextInput) nextInput.focus()
  }

  const validateOtp = (code: string) => {
    if (code.length < 6) {
      setError('Please enter all 6 digits')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTouched(true)
    const code = otp.join('')
    
    if (!validateOtp(code)) return
    
    setLoading(true)
    setApiError('')
    try {
      await axios.post('/api/auth/verify-otp', { email, otp: code })
      router.push('/login?verified=true')
    } catch (error: any) {
      setApiError(error.response?.data?.error || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setApiError('')
    try {
      await axios.post('/api/auth/send-otp', { email })
      setTimer(60)
      setCanResend(false)
      setOtp(['', '', '', '', '', ''])
    } catch (error: any) {
      setApiError(error.response?.data?.error || 'Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-6 shadow-lg rounded-lg">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <span className="text-blue-600 text-xl">✉</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Verify your email</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We have sent a 6-digit code to{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">{email || 'your email'}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={'otp-' + index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={'w-12 h-12 text-center text-lg font-bold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ' + 
                  (touched && !digit ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-700')
                }
                aria-label={'OTP digit ' + (index + 1)}
              />
            ))}
          </div>

          {touched && error && (
            <p className="text-center text-xs text-red-600 mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify email'}
          </button>
        </form>

        {apiError && (
          <p className="mt-4 text-center text-xs text-red-600">{apiError}</p>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Did not receive the code?{' '}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center"
              >
                <span className="mr-1">↻</span>
                Resend code
              </button>
            ) : (
              <span className="text-gray-400">
                Resend in {timer}s
              </span>
            )}
          </p>
        </div>

        <div className="mt-4 text-center">
          <a href="/signup" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            ← Back to sign up
          </a>
        </div>
      </div>
    </div>
  )
}
