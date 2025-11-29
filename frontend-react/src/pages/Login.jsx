import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    const result = await login(data.email, data.password)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.message)
    }

    setLoading(false)
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
              🔐
            </div>
          </div>
          <h2 className="text-3xl font-black text-black mb-2">
            WELCOME BACK
          </h2>
          <p className="text-black/80 font-semibold">
            Sign in to your Grand Imperion account
          </p>
        </div>

        {/* Login Form Card */}
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

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                  PASSWORD
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-yellow-500 hover:text-yellow-400 transition-colors duration-300"
                >
                  Forgot Password?
                </Link>
              </div>
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
                  placeholder="Enter your password"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔒
                </div>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm font-semibold flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-lg font-black rounded-xl text-black bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  <span>PROCESSING...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>🚀</span>
                  <span>SIGN IN</span>
                </div>
              )}
            </button>

          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 font-semibold">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-black text-yellow-500 hover:text-yellow-400 transition-all duration-300 underline hover:no-underline"
              >
                CREATE ACCOUNT
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-yellow-500/20">
              <div className="text-yellow-500 text-lg mb-1">🔒</div>
              <div className="text-white text-xs font-bold">Secure</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-yellow-500/20">
              <div className="text-yellow-500 text-lg mb-1">⚡</div>
              <div className="text-white text-xs font-bold">Fast</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-yellow-500/20">
              <div className="text-yellow-500 text-lg mb-1">💎</div>
              <div className="text-white text-xs font-bold">Premium</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-400 text-sm font-semibold">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-yellow-500 hover:text-yellow-400 font-bold">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-yellow-500 hover:text-yellow-400 font-bold">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login