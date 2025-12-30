import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const GoogleCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get authorization code from URL parameters
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          console.error('Google OAuth Error:', error)
          navigate('/login?error=google_auth_failed')
          return
        }

        if (!code) {
          console.error('No authorization code received')
          navigate('/login?error=no_auth_code')
          return
        }

        // Send authorization code to backend
        const response = await fetch('http://localhost:5000/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important for CORS
          body: JSON.stringify({ code })
        })

        const result = await response.json()

        if (response.ok) {
          // Store token and user data
          localStorage.setItem('token', result.access_token)
          login(result.user, result.access_token)
          
          // Redirect to home page
          navigate('/')
        } else {
          console.error('Backend error:', result)
          throw new Error(result.message || 'Google authentication failed')
        }
      } catch (error) {
        console.error('Google Callback Error:', error)
        navigate('/login?error=auth_failed')
      }
    }

    handleGoogleCallback()
  }, [searchParams, navigate, login])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center max-w-md mx-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
        />
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Completing Sign In
        </h2>
        
        <p className="text-gray-600">
          Please wait while we complete your Google authentication...
        </p>
      </motion.div>
    </div>
  )
}

export default GoogleCallback