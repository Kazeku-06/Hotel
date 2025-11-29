import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export const Register = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    try {
      const result = await registerUser(data)

      if (result.success) {
        navigate('/')
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-2xl p-8 text-center shadow-2xl shadow-yellow-500/25 transform -translate-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-black text-yellow-500 p-3 rounded-2xl text-2xl">
              ✨
            </div>
          </div>
          <h2 className="text-3xl font-black text-black mb-2">
            JOIN US TODAY
          </h2>
          <p className="text-black/80 font-semibold">
            Create your Grand Imperion account
          </p>
        </div>

        {/* Register Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-500/10 border-2 border-red-500/20 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl font-semibold text-center backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                FULL NAME
              </label>
              <div className="relative">
                <input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 bg-white dark:bg-gray-700 transition-all duration-300 font-medium"
                  placeholder="Enter your full name"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  👤
                </div>
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm font-semibold flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 bg-white dark:bg-gray-700 transition-all duration-300 font-medium"
                  placeholder="Enter your email address"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ✉️
                </div>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm font-semibold flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                PHONE NUMBER
              </label>
              <div className="relative">
                <input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+\-\s()]*$/,
                      message: 'Invalid phone number'
                    }
                  })}
                  type="tel"
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 bg-white dark:bg-gray-700 transition-all duration-300 font-medium"
                  placeholder="Enter your phone number"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  📞
                </div>
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm font-semibold flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.phone.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type="password"
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 bg-white dark:bg-gray-700 transition-all duration-300 font-medium"
                  placeholder="Create a strong password"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔑
                </div>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm font-semibold flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type="password"
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 bg-white dark:bg-gray-700 transition-all duration-300 font-medium"
                  placeholder="Confirm your password"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ✅
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm font-semibold flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.confirmPassword.message}</span>
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600">
              <input
                type="checkbox"
                {...register('terms', {
                  required: 'You must accept the terms and conditions'
                })}
                className="w-4 h-4 text-yellow-500 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                I agree to the{' '}
                <Link to="/terms" className="text-yellow-500 hover:text-yellow-400 font-bold">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-yellow-500 hover:text-yellow-400 font-bold">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-sm font-semibold flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.terms.message}</span>
              </p>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-lg font-black rounded-xl text-black bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  <span>CREATING ACCOUNT...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>🎉</span>
                  <span>CREATE ACCOUNT</span>
                </div>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 font-semibold">
                  ALREADY HAVE AN ACCOUNT?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:border-yellow-500 hover:text-yellow-500 transition-all duration-300"
              >
                <span className="mr-2">🔐</span>
                SIGN IN TO EXISTING ACCOUNT
              </Link>
            </div>
          </form>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-400/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
          <h3 className="text-lg font-black text-white text-center mb-4">
            🎁 JOIN NOW & GET THESE BENEFITS
          </h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-yellow-500 text-sm mb-1">🏆</div>
              <div className="text-white text-xs font-bold">Member Discounts</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-yellow-500 text-sm mb-1">⚡</div>
              <div className="text-white text-xs font-bold">Fast Booking</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-yellow-500 text-sm mb-1">💎</div>
              <div className="text-white text-xs font-bold">Exclusive Deals</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-yellow-500 text-sm mb-1">⭐</div>
              <div className="text-white text-xs font-bold">Reward Points</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register