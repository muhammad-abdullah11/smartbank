'use client'
import { useState, type ChangeEvent, type FormEvent, type FocusEvent } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { FaEnvelope, FaLock } from 'react-icons/fa'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
  const [formData, setFormData] = useState({
    email: '',
    otp: ['', '', '', '', '', ''],
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [touched, setTouched] = useState({
    email: false,
    newPassword: false,
    confirmPassword: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password: string): boolean => password.length >= 8

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (touched[name as keyof typeof touched]) {
      validateField(name, value)
    }
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const validateField = (name: string, value: string) => {
    let error = ''
    switch (name) {
      case 'email':
        if (!value.trim()) error = 'Email is required'
        else if (!validateEmail(value)) error = 'Invalid email address'
        break
      case 'newPassword':
        if (!value) error = 'Password is required'
        else if (!validatePassword(value)) error = 'Password must be at least 8 characters'
        break
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password'
        else if (value !== formData.newPassword) error = 'Passwords do not match'
        break
      default:
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newOtp = [...formData.otp]
    newOtp[index] = value
    setFormData(prev => ({ ...prev, otp: newOtp }))

    if (value && index < 5) {
      const nextInput = document.getElementById('otp-' + (index + 1))
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById('otp-' + (index - 1))
      if (prevInput) prevInput.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...formData.otp]
    pastedData.split('').forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit
    })
    setFormData(prev => ({ ...prev, otp: newOtp }))
    
    const nextIndex = Math.min(pastedData.length, 5)
    const nextInput = document.getElementById('otp-' + nextIndex)
    if (nextInput) nextInput.focus()
  }

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const allTouched = { email: true, newPassword: false, confirmPassword: false }
    setTouched(allTouched)
    
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }))
      return
    }
    if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email address' }))
      return
    }

    setLoading(true)
    setApiError('')
    try {
      await axios.post('/api/auth/forgot-password', { email: formData.email })
      setStep('otp')
      startTimer()
    } catch (error: any) {
      setApiError(error.response?.data?.error || 'Failed to send reset code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startTimer = () => {
    setTimer(60)
    setCanResend(false)
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
  }

  const handleOtpSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const otpString = formData.otp.join('')
    if (otpString.length < 6) {
      setErrors(prev => ({ ...prev, otp: 'Please enter all 6 digits' }))
      return
    }
    setErrors(prev => ({ ...prev, otp: '' }))
    setStep('reset')
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setApiError('')
    try {
      await axios.post('/api/auth/forgot-password', { email: formData.email })
      startTimer()
    } catch (error: any) {
      setApiError(error.response?.data?.error || 'Failed to resend code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const allTouched = { email: true, newPassword: true, confirmPassword: true }
    setTouched(allTouched)
    
    let isValid = true
    const newErrors = { ...errors }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required'
      isValid = false
    } else if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = 'Password must be at least 8 characters'
      isValid = false
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
      isValid = false
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      isValid = false
    }
    
    setErrors(newErrors)
    
    if (isValid) {
      setLoading(true)
      setApiError('')
      try {
        await axios.post('/api/auth/reset-password', {
          email: formData.email,
          otp: formData.otp.join(''),
          newPassword: formData.newPassword
        })
        router.push('/login?reset=true')
      } catch (error: any) {
        setApiError(error.response?.data?.error || 'Password reset failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const getInputClass = (field: string) => {
    const base = 'block w-full py-2 border text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-offset-1 pl-10 pr-3'
    if (touched[field as keyof typeof touched] && errors[field as keyof typeof errors]) {
      return base + ' border-red-300 focus:ring-red-500 focus:border-red-500'
    }
    return base + ' border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  }

  return (
    <div className="w-full h-full overflow-hidden bg-white p-4 sm:p-6 shadow-lg rounded-lg" role="main" aria-label="Forgot password page">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-center text-lg font-extrabold text-gray-900">
          {step === 'email' && 'Forgot your password?'}
          {step === 'otp' && 'Verify your email'}
          {step === 'reset' && 'Reset your password'}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'email' && 'Enter your email address and we will send you a reset code.'}
          {step === 'otp' && 'We sent a 6-digit code to ' + formData.email}
          {step === 'reset' && 'Enter your new password below.'}
        </p>
      </div>

      <div className="mt-6 mx-auto w-full max-w-md">
        {step === 'email' && (
          <form className="space-y-4" onSubmit={handleEmailSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('email')}
                  placeholder="you@example.com"
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-0.5 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {apiError && (
              <p className="text-center text-sm text-red-600">{apiError}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form className="space-y-4" onSubmit={handleOtpSubmit} noValidate>
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {formData.otp.map((digit, index) => (
                <input
                  key={index}
                  id={'otp-' + index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className={'w-12 h-12 text-center text-lg font-bold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ' + 
                    (errors.otp && !digit ? 'border-red-300' : 'border-gray-300')
                  }
                  aria-label={'OTP digit ' + (index + 1)}
                />
              ))}
            </div>

            {errors.otp && (
              <p className="text-center text-xs text-red-600">{errors.otp}</p>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
            >
              Verify code
            </button>

            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                >
                  Resend code
                </button>
              ) : (
                <span className="text-sm text-gray-400">Resend in {timer}s</span>
              )}
            </div>

            {apiError && (
              <p className="text-center text-sm text-red-600">{apiError}</p>
            )}
          </form>
        )}

        {step === 'reset' && (
          <form className="space-y-4" onSubmit={handleResetSubmit} noValidate>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('newPassword') + ' pr-10'}
                  placeholder="At least 8 characters"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                    {showPassword ? <span className="text-xs">HIDE</span> : <span className="text-xs">SHOW</span>}
                  </button>
                </div>
              </div>
              {touched.newPassword && errors.newPassword && (
                <p className="mt-0.5 text-xs text-red-600">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm new password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('confirmPassword') + ' pr-10'}
                  placeholder="Confirm your password"
                />
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-0.5 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {apiError && (
              <p className="text-center text-sm text-red-600">{apiError}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 text-center">
          <a href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            ← Back to sign in
          </a>
        </div>
      </div>
    </div>
  )
}
