'use client'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { FaExchangeAlt, FaPaperPlane, FaUser } from 'react-icons/fa'

export default function TransferPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    toAccountNumber: '',
    amount: '',
    description: ''
  })
  const [errors, setErrors] = useState({
    toAccountNumber: '',
    amount: '',
    description: ''
  })
  const [touched, setTouched] = useState({
    toAccountNumber: false,
    amount: false
  })
  const [loading, setLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState({ type: '', message: '' })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (touched[name as keyof typeof touched]) {
      validateField(name, value)
    }
    setApiMessage({ type: '', message: '' })
  }

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const validateField = (name: string, value: string) => {
    let error = ''
    switch (name) {
      case 'toAccountNumber':
        if (!value.trim()) error = 'Account number or email is required'
        break
      case 'amount':
        if (!value) error = 'Amount is required'
        else if (isNaN(Number(value)) || Number(value) <= 0) error = 'Please enter a valid amount'
        else if (Number(value) < 1) error = 'Minimum transfer amount is RS 1'
        break
      default:
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const allTouched = { toAccountNumber: true, amount: true }
    setTouched(allTouched)
    
    let isValid = true
    const newErrors = { ...errors }
    
    if (!formData.toAccountNumber.trim()) {
      newErrors.toAccountNumber = 'Account number or email is required'
      isValid = false
    }
    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
      isValid = false
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
      isValid = false
    }
    
    setErrors(newErrors)
    
    if (isValid) {
      setLoading(true)
      setApiMessage({ type: '', message: '' })
      try {
        const response = await axios.post('/api/transactions', {
          toAccountNumber: formData.toAccountNumber,
          amount: Number(formData.amount),
          description: formData.description || undefined
        })
        
        if (response.data.success) {
          setApiMessage({ type: 'success', message: response.data.message || 'Transfer completed successfully!' })
          setFormData({ toAccountNumber: '', amount: '', description: '' })
          setTouched({ toAccountNumber: false, amount: false })
        } else {
          setApiMessage({ type: 'error', message: response.data.message || 'Transfer failed. Please try again.' })
        }
      } catch (error: any) {
        setApiMessage({ 
          type: 'error', 
          message: error.response?.data?.message || 'Transfer failed. Please try again.' 
        })
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
    return base + ' border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-16  md:p-4 sm:p-6 lg:p-8">
      <section className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl pt-8 text-center sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Send Money</h1>
          <p className="mt-1 text-sm text-center text-gray-600 dark:text-gray-400">Transfer funds to another SmartBank account</p>
        </div>

        <section className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="toAccountNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recipient (Email or Account Number)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="toAccountNumber"
                  name="toAccountNumber"
                  type="text"
                  autoComplete="off"
                  value={formData.toAccountNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('toAccountNumber')}
                  placeholder="Enter email or account number"
                />
              </div>
              {touched.toAccountNumber && errors.toAccountNumber && (
                <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.toAccountNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (RS)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 dark:text-gray-500 text-sm">RS</span>
                </div>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('amount')}
                  placeholder="0.00"
                />
              </div>
              {touched.amount && errors.amount && (
                <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.amount}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
              <div className="mt-1">
                <input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="What's this transfer for?"
                />
              </div>
            </div>

            {apiMessage.message && (
              <div className={`p-3 rounded-md text-sm ${
                apiMessage.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}>
                {apiMessage.message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50"
              >
                <FaPaperPlane className="w-4 h-4" />
                {loading ? 'Processing...' : 'Send Money'}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <FaExchangeAlt className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">Transfer Information</p>
              <ul className="mt-1 space-y-1">
                <li>• Transfers are processed immediately</li>
                <li>• You can send to email or account number</li>
                <li>• Daily and monthly limits apply</li>
                <li>• No fees for SmartBank transfers</li>
              </ul>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
