import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FaGoogle } from 'react-icons/fa'
import googleAuthService from '../services/googleAuth'

const GoogleOAuth3D = ({ onSuccess, onError, buttonText = "Continue with Google" }) => {
  const buttonRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const initializeGoogle = async () => {
      try {
        await googleAuthService.initialize()
      } catch (error) {
        console.error('Failed to initialize Google OAuth:', error)
        if (onError) {
          onError(error)
        }
      }
    }

    initializeGoogle()
  }, [onError])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // Start OAuth flow - this will redirect to Google
      googleAuthService.startOAuthFlow()
    } catch (error) {
      console.error('Google OAuth Error:', error)
      if (onError) {
        onError(error)
      }
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <motion.button
        whileHover={{ scale: 1.02, rotateX: 5 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          transform: 'perspective(1000px) rotateX(0deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
        ) : (
          <FaGoogle className="text-xl text-red-500" />
        )}
        <span className="text-sm font-medium">
          {isLoading ? 'Redirecting...' : buttonText}
        </span>
      </motion.button>
    </motion.div>
  )
}

export default GoogleOAuth3D