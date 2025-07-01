import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiMail, FiLock, FiUser, FiLoader, FiShield, FiCheck, FiAlertCircle } = FiIcons

const InviteSignup = ({ token, onSignUp, onBack }) => {
  const [inviteData, setInviteData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Simulate fetching invitation data
    const fetchInviteData = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock invitation data
        const mockInvite = {
          id: 'inv1',
          email: 'alice@example.com',
          role: 'member',
          workspace: {
            name: 'Acme Corp Workspace'
          },
          inviter: {
            name: 'John Doe'
          },
          expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          valid: true
        }
        
        setInviteData(mockInvite)
      } catch (error) {
        setMessage('Failed to load invitation details')
        setMessageType('error')
      } finally {
        setLoading(false)
      }
    }

    fetchInviteData()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    
    // Validation
    if (!formData.name.trim()) {
      setMessage('Name is required')
      setMessageType('error')
      return
    }
    
    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long')
      setMessageType('error')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match')
      setMessageType('error')
      return
    }

    setSubmitting(true)
    
    try {
      const result = await onSignUp(inviteData.email, formData.password, {
        name: formData.name,
        inviteToken: token
      })
      
      if (result?.error) {
        setMessage(result.error.message)
        setMessageType('error')
      } else {
        setMessage('Account created successfully! Welcome to the workspace.')
        setMessageType('success')
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.')
      setMessageType('error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiLoader} className="w-8 h-8 text-white animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">PulseHQ</h1>
          <p className="text-purple-200">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (!inviteData || !inviteData.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center"
        >
          <SafeIcon icon={FiAlertCircle} className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired. Please contact your team administrator for a new invitation.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-accent-blue hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Back to Sign In
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiShield} className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Workspace</h1>
          <p className="text-gray-600">
            You've been invited to join <strong>{inviteData.workspace.name}</strong> by {inviteData.inviter.name}
          </p>
        </div>

        {/* Invitation Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiMail} className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Email: {inviteData.email}</p>
              <p className="text-sm text-blue-700">Role: {inviteData.role}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Create a password (6+ characters)"
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {submitting ? (
              <SafeIcon icon={FiLoader} className="animate-spin mr-2 w-5 h-5" />
            ) : (
              <SafeIcon icon={FiCheck} className="mr-2 w-5 h-5" />
            )}
            {submitting ? 'Creating Account...' : 'Join Workspace'}
          </button>
        </form>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg text-sm flex items-start space-x-2 ${
              messageType === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : messageType === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <SafeIcon 
              icon={messageType === 'success' ? FiCheck : FiAlertCircle} 
              className="w-4 h-4 mt-0.5 flex-shrink-0" 
            />
            <span className="flex-1">{message}</span>
          </motion.div>
        )}

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            disabled={submitting}
            className="text-blue-600 hover:text-blue-700 text-sm transition-colors disabled:opacity-50"
          >
            Back to Sign In
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default InviteSignup