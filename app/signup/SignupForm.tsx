'use client'
import { useState, type ChangeEvent, type FormEvent, type FocusEvent } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCalendar, FaHome } from 'react-icons/fa'

interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export default function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    password: '',
    accountType: 'savings',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    } as Address
  })
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    password: '',
    address: ''
  })
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    dateOfBirth: false,
    password: false,
    address: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password: string): boolean => password.length >= 8

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    if (touched[name as keyof typeof touched]) {
      validateField(name, value)
    }
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const validateField = (name: string, value: string) => {
    let error = ''
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required'
        break
      case 'email':
        if (!value.trim()) error = 'Email is required'
        else if (!validateEmail(value)) error = 'Invalid email address'
        break
      case 'dateOfBirth':
        if (!value) error = 'Date of birth is required'
        else {
          const dob = new Date(value)
          const today = new Date()
          const age = today.getFullYear() - dob.getFullYear()
          if (dob > today) error = 'Date of birth cannot be in the future'
          else if (age < 18) error = 'You must be at least 18 years old'
        }
        break
      case 'password':
        if (!value) error = 'Password is required'
        else if (!validatePassword(value)) error = 'Password must be at least 8 characters'
        break
      case 'address.street':
      case 'address.city':
      case 'address.state':
      case 'address.postalCode':
      case 'address.country':
        if (!value.trim()) error = 'This field is required'
        break
      default:
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const allTouched = {
      fullName: true,
      email: true,
      dateOfBirth: true,
      password: true,
      address: true
    }
    setTouched(allTouched)
    const newErrors = { ...errors }
    let isValid = true

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
      isValid = false
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address'
      isValid = false
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
      isValid = false
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters'
      isValid = false
    }
    if (!formData.address.street.trim() || !formData.address.city.trim() || 
        !formData.address.state.trim() || !formData.address.postalCode.trim() || 
        !formData.address.country.trim()) {
      newErrors.address = 'Complete address is required'
      isValid = false
    }

    setErrors(newErrors)
    if (isValid) {
      setLoading(true)
      setApiError('')
      try {
        await axios.post('/api/auth/signups', formData)
        router.push('/verify-email/' + encodeURIComponent(formData.email))
      } catch (error: any) {
        setApiError(error.response?.data?.error || 'Registration failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const getInputClass = (field: string) => {
    const base = 'block w-full py-1 border text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-offset-1'
    if (touched[field as keyof typeof touched] && errors[field as keyof typeof errors]) {
      return base + ' pl-10 pr-3 border-red-300 focus:ring-red-500 focus:border-red-500'
    }
    return base + ' pl-10 pr-3 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  }

  const getAddressInputClass = () => {
    const base = 'block w-full py-1 border text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-offset-1 px-3'
    if (touched.address && errors.address) {
      return base + ' border-red-300 focus:ring-red-500 focus:border-red-500'
    }
    return base + ' border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  }

  return (
    <div className="w-full h-full overflow-hidden bg-white p-3 sm:p-4 shadow-lg rounded-lg" role="main" aria-label="Sign up page">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-center text-lg font-extrabold text-gray-900">Create your account</h1>
        <p className="mt-1 text-center text-xs text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
        </p>
      </div>

      <div className="mt-3 mx-auto w-full max-w-md">
        <form className="space-y-2" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-gray-700">Full name</label>
              <div className="mt-0.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('fullName')}
                  placeholder="John Doe"
                />
              </div>
              {touched.fullName && errors.fullName && (
                <p className="mt-0.5 text-xs text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700">Email address</label>
              <div className="mt-0.5 relative rounded-md shadow-sm">
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
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-xs font-medium text-gray-700">Date of birth</label>
            <div className="mt-0.5 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                autoComplete="bday"
                value={formData.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('dateOfBirth')}
              />
            </div>
            {touched.dateOfBirth && errors.dateOfBirth && (
              <p className="mt-0.5 text-xs text-red-600">{errors.dateOfBirth}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">Address</label>
            <div className="mt-0.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="sm:col-span-2">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-1.5 flex items-start pointer-events-none">
                    <FaHome className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="address.street"
                    name="address.street"
                    type="text"
                    autoComplete="street-address"
                    value={formData.address.street}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getAddressInputClass() + ' pl-10'}
                    placeholder="Street address"
                  />
                </div>
              </div>
              <div>
                <input
                  id="address.city"
                  name="address.city"
                  type="text"
                  autoComplete="address-level2"
                  value={formData.address.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getAddressInputClass()}
                  placeholder="City"
                />
              </div>
              <div>
                <input
                  id="address.state"
                  name="address.state"
                  type="text"
                  autoComplete="address-level1"
                  value={formData.address.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getAddressInputClass()}
                  placeholder="State"
                />
              </div>
              <div>
                <input
                  id="address.postalCode"
                  name="address.postalCode"
                  type="text"
                  autoComplete="postal-code"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getAddressInputClass()}
                  placeholder="Postal code"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  id="address.country"
                  name="address.country"
                  type="text"
                  autoComplete="country-name"
                  value={formData.address.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getAddressInputClass()}
                  placeholder="Country"
                />
              </div>
            </div>
            {touched.address && errors.address && (
              <p className="mt-0.5 text-xs text-red-600">{errors.address}</p>
            )}
          </div>

          <div>
            <label htmlFor="accountType" className="block text-xs font-medium text-gray-700">Account type</label>
            <div className="mt-0.5">
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="block w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="savings">Savings</option>
                <option value="checking">Checking</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-700">Password</label>
            <div className="mt-0.5 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('password') + ' pr-10'}
                placeholder="At least 8 characters"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                  {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {touched.password && errors.password && (
              <p className="mt-0.5 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-1 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </div>

          {apiError && (
            <p className="text-center text-xs text-red-600">{apiError}</p>
          )}
        </form>
      </div>
    </div>
  )
}
