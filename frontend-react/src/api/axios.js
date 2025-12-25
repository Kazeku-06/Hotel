import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url)
    
    // Coba berbagai kemungkinan key token
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Token attached to request')
    }
    
    // Ensure Content-Type is set
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized, logging out...')
      // Hapus semua kemungkinan key token
      localStorage.removeItem('access_token')
      localStorage.removeItem('token')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // Handle CORS errors specifically
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🌐 Network/CORS Error - Check if backend is running and CORS configured')
      console.error('💡 Solution: Make sure backend is running on port 5000 and CORS is properly configured')
    }
    
    return Promise.reject(error)
  }
)

export default api