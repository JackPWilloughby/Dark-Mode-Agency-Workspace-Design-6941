import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { 
  FiMail, FiLock, FiLoader, FiEye, FiEyeOff, FiShield, FiUser, 
  FiAlertCircle, FiCheckCircle, FiInfo, FiArrowLeft, FiCheck, FiStar 
} = FiIcons

const AuthForm = ({ onSignIn }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('error')

  const validateForm = () => {
    setMessage('')
    
    if (!formData.email?.trim()) {
      setMessage('Email is required')
      setMessageType('error')
      return false
    }
    
    if (!formData.email.includes('@')) {
      setMessage('Please enter a valid email address')
      setMessageType('error')
      return false
    }
    
    if (!showForgotPassword && !formData.password) {
      setMessage('Password is required')
      setMessageType('error')
      return false
    }
    
    if (!isLogin && !showForgotPassword) {
      if (!formData.name?.trim()) {
        setMessage('Full name is required')
        setMessageType('error')
        return false
      }
      
      if (formData.password.length < 6) {
        setMessage('Password must be at least 6 characters long')
        setMessageType('error')
        return false
      }
      
      if (formData.password !== formData.confirmPassword) {
        setMessage('Passwords do not match')
        setMessageType('error')
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setMessage('')
    
    try {
      if (showForgotPassword) {
        const result = await onSignIn(formData.email, '', null, 'reset')
        if (result?.error) {
          setMessage(result.error.message)
          setMessageType('error')
        } else {
          setMessage('If an account exists, you will receive a password reset link.')
          setMessageType('info')
          setShowForgotPassword(false)
        }
      } else {
        const result = await onSignIn(
          formData.email,
          formData.password,
          isLogin ? null : { name: formData.name }
        )
        
        if (result?.error) {
          setMessage(result.error.message)
          setMessageType('error')
        } else if (result?.message) {
          setMessage(result.message)
          setMessageType(result.message.includes('email') || result.message.includes('check') ? 'info' : 'success')
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    })
    setMessage('')
    setShowForgotPassword(false)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success': return FiCheckCircle
      case 'info': return FiInfo
      default: return FiAlertCircle
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Left Side - Branding - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8">
              <SafeIcon icon={FiShield} className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              PulseHQ
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              The all-in-one workspace for modern teams. Manage projects, track contacts, and collaborate seamlessly.
            </p>

            {/* Trust Indicators */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-100">Enterprise-grade security</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-100">SOC 2 Type II compliant</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-100">99.9% uptime guaranteed</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <SafeIcon key={i} icon={FiStar} className="w-5 h-5 fill-current" />
              ))}
              <span className="ml-2 text-blue-100">Trusted by 10,000+ teams</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form - Full width on mobile */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Mobile Logo - Always visible on mobile */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <SafeIcon icon={FiShield} className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">PulseHQ</h1>
              <p className="text-sm text-gray-600 mt-1">Agency Workspace</p>
            </div>

            {/* Form Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {showForgotPassword ? 'Reset Password' : isLogin ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {showForgotPassword 
                  ? 'Enter your email to receive reset instructions' 
                  : isLogin 
                  ? 'Sign in to your workspace' 
                  : 'Start your free trial today'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Back button for forgot password */}
              {showForgotPassword && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <SafeIcon icon={FiArrowLeft} className="w-4 h-4 mr-2" />
                  Back to sign in
                </button>
              )}

              {/* Signup Fields */}
              {!isLogin && !showForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Enter your full name"
                      required={!isLogin}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              {!showForgotPassword && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 sm:pl-11 pr-10 sm:pr-11 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder={isLogin ? "Enter your password" : "Create a password (6+ characters)"}
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="Confirm your password"
                          required={!isLogin}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Forgot Password Link */}
              {isLogin && !showForgotPassword && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
              >
                {loading ? (
                  <SafeIcon icon={FiLoader} className="animate-spin mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <SafeIcon icon={FiShield} className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                )}
                {loading 
                  ? (showForgotPassword ? 'Sending...' : isLogin ? 'Signing In...' : 'Creating Account...') 
                  : (showForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account')
                }
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
                    : messageType === 'info' 
                    ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <SafeIcon icon={getMessageIcon()} className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{message}</span>
              </motion.div>
            )}

            {/* Toggle Mode */}
            {!showForgotPassword && (
              <div className="mt-4 sm:mt-6 text-center">
                <button
                  onClick={toggleMode}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 text-sm transition-colors disabled:opacity-50"
                >
                  {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                </button>
              </div>
            )}

            {/* Security Footer - Simplified on mobile */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-xs text-gray-500">
                <span>🔒 SSL Encrypted</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">🛡️ GDPR Compliant</span>
                <span>•</span>
                <span>⭐ SOC 2 Certified</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthForm