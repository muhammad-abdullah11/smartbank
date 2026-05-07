'use client'
import { useState } from 'react'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCalendar, FaHome } from 'react-icons/fa'

export default function SignupForm() {
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
    }
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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password) => password.length >= 8

  const handleChange = (e) => {
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
    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const validateField = (name, value) => {
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
          if (dob > today) error = 'Date of birth cannot be in the future'
          else if (today.getFullYear() - dob.getFullYear() < 18) error = 'Must be at least 18 years old'
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

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({
      fullName: true,
      email: true,
      dateOfBirth: true,
      password: true,
      address: true
    })
    let isValid = true
    const newErrors = { ...errors }

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
    if (!formData.address.street.trim() || !formData.address.city.trim() || !formData.address.state.trim() || !formData.address.postalCode.trim() || !formData.address.country.trim()) {
      newErrors.address = 'Complete address is required'
      isValid = false
    }

    setErrors(newErrors)
    if (isValid) {
      console.log('Form submitted', formData)
    }
  }

  const getInputClass = (field) => {
    const base = 'block w-full py-1 border text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-offset-1'
    if (touched[field] && errors[field]) {
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
                  placeholder="name?"
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
              className="w-full flex justify-center py-1 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
