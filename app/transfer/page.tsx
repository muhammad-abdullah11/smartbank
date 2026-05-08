'use client'

import React, { useState } from 'react'
import { FaExchangeAlt, FaEnvelope, FaCreditCard, FaDollarSign, FaFileAlt, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa'

export default function Transfer() {
  const [transferType, setTransferType] = useState('account')
  const [accountNumber, setAccountNumber] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateAccountNumber = (value) => {
    return /^[A-Z0-9]{16}$/.test(value)
  }

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const validateForm = () => {
    const newErrors = {}

    if (transferType === 'account') {
      if (!accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required'
      } else if (!validateAccountNumber(accountNumber)) {
        newErrors.accountNumber = 'Account number must be 16 alphanumeric characters (e.g., 27DA13BC8EE78B1F)'
      }
    } else {
      if (!email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!validateEmail(email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSend = () => {
    if (validateForm()) {
      setShowConfirm(true)
    }
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const payload = {
        toAccountNumber: transferType === 'account' ? accountNumber : email,
        amount: parseFloat(amount),
        description,
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': `${Date.now()}-${Math.random()}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setAccountNumber('')
        setEmail('')
        setAmount('')
        setDescription('')
        setShowConfirm(false)
        alert('Transfer completed successfully!')
      } else {
        const data = await response.json()
        alert(data.message || 'Transfer failed')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
      <section className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FaExchangeAlt className="text-2xl text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Send Money</h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">Transfer funds to another account securely</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Transfer Method</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="transferType"
                  value="account"
                  checked={transferType === 'account'}
                  onChange={(e) => {
                    setTransferType(e.target.value)
                    setErrors({})
                    setEmail('')
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 font-medium">Account Number</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="transferType"
                  value="email"
                  checked={transferType === 'email'}
                  onChange={(e) => {
                    setTransferType(e.target.value)
                    setErrors({})
                    setAccountNumber('')
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 font-medium">Email</span>
              </label>
            </div>
          </div>

          {transferType === 'account' ? (
            <div className="mb-6">
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FaCreditCard className="text-blue-600" />
                  Account Number
                </div>
              </label>
              <input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value.toUpperCase())
                  if (errors.accountNumber) setErrors({ ...errors, accountNumber: '' })
                }}
                placeholder="27DA13BC8EE78B1F"
                maxLength="16"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
                  errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.accountNumber && <p className="text-red-600 text-sm mt-1">{errors.accountNumber}</p>}
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-blue-600" />
                  Email Address
                </div>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: '' })
                }}
                placeholder="user@example.com"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FaDollarSign className="text-blue-600" />
                Amount
              </div>
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                if (errors.amount) setErrors({ ...errors, amount: '' })
              }}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.amount && <p className="text-red-600 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div className="mb-8">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FaFileAlt className="text-blue-600" />
                Description (Optional)
              </div>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note for this transfer..."
              rows={3}
              maxLength={255}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-gray-500 text-xs mt-1">{description.length}/255</p>
          </div>

          <button
            onClick={handleSend}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FaExchangeAlt />
            Send Money
          </button>
        </div>
      </section>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Confirm Transfer</h2>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Recipient:</span>
                <span className="font-semibold text-gray-900">{transferType === 'account' ? accountNumber : email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Amount:</span>
                <span className="font-semibold text-green-600">${parseFloat(amount).toFixed(2)}</span>
              </div>
              {description && (
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Note:</span>
                  <span className="font-semibold text-gray-900">{description}</span>
                </div>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-6">
              Please review the details above. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}