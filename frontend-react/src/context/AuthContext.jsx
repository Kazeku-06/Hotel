// AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (!token) {
          setLoading(false)
          return
        }

        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          console.log('📋 Saved user from localStorage:', parsedUser)
          setUser(parsedUser)
        }

        const response = await authAPI.getMe()
        const verifiedUser = response.data
        console.log('✅ Verified user from API:', verifiedUser)
        
        setUser(verifiedUser)
        localStorage.setItem('user', JSON.stringify(verifiedUser))
      } catch (error) {
        console.error('Auth check failed:', error)
        
        if (error.response?.status === 401) {
          logout()
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const register = async (userData) => {
    try {
      setLoading(true)
      
      // Hapus confirmPassword sebelum dikirim ke API
      const { confirmPassword, ...registrationData } = userData
      
      console.log('📤 Sending registration data:', registrationData)
      
      const response = await authAPI.register(registrationData)
      const { access_token, user } = response.data

      console.log('✅ Register successful, user data:', user)

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)

      return { success: true }
    } catch (error) {
      console.error('❌ Registration error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data
      })
      
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      return { 
        success: false, 
        message: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { access_token, user } = response.data

      console.log('🔑 Login successful, user data:', user)

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!localStorage.getItem('token'),
    isAdmin: user?.role === 'admin',
    isMember: user?.role === 'member',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}