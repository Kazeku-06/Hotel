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

        // Jika ada savedUser, gunakan dulu untuk immediate UI
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }

        // Always verify token with backend
        const response = await authAPI.getMe()
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      } catch (error) {
        console.error('Auth check failed:', error)
        
        // Only logout on specific errors (401 Unauthorized)
        if (error.response?.status === 401) {
          logout()
        }
        // Untuk error lainnya (network error, server down, dll), biarkan user tetap login
        // dengan data yang ada di localStorage
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { access_token, user } = response.data

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

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      
      // Auto login after registration
      const loginResult = await login(userData.email, userData.password)
      return loginResult
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // PERBAIKAN: Tambahkan fungsi untuk cek apakah user bisa booking
  const canBookRoom = () => {
    return !!user && user.role === 'member'
  }

  // PERBAIKAN: Tambahkan fungsi untuk cek apakah user admin
  const isAdminUser = () => {
    return !!user && user.role === 'admin'
  }

  // Update isAuthenticated untuk double check dengan localStorage
  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!localStorage.getItem('token'),
    isAdmin: user?.role === 'admin',
    isMember: user?.role === 'member',
    canBookRoom: canBookRoom(),
    isAdminUser: isAdminUser()
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}