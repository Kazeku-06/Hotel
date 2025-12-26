import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const adminAPI = {
  // Dashboard stats
  getDashboardStats: async (timeRange = '7d') => {
    try {
      console.log('🚀 API Request: GET /admin/dashboard', { timeRange })
      const response = await api.get('/admin/dashboard', {
        params: { timeRange }
      })
      console.log('✅ API Response:', response.status, '/admin/dashboard')
      return response.data
    } catch (error) {
      console.error('❌ Admin Dashboard API Error:', error)
      throw error
    }
  },

  // Rooms management
  getRooms: async (filters = {}) => {
    try {
      console.log('🚀 API Request: GET /admin/rooms')
      const response = await api.get('/admin/rooms', { params: filters })
      console.log('✅ API Response:', response.status, '/admin/rooms')
      return response.data
    } catch (error) {
      console.error('❌ Admin Rooms API Error:', error)
      throw error
    }
  },

  createRoom: async (roomData) => {
    try {
      const response = await api.post('/admin/rooms', roomData)
      return response.data
    } catch (error) {
      console.error('❌ Create Room API Error:', error)
      throw error
    }
  },

  updateRoom: async (roomId, roomData) => {
    try {
      const response = await api.put(`/admin/rooms/${roomId}`, roomData)
      return response.data
    } catch (error) {
      console.error('❌ Update Room API Error:', error)
      throw error
    }
  },

  deleteRoom: async (roomId) => {
    try {
      const response = await api.delete(`/admin/rooms/${roomId}`)
      return response.data
    } catch (error) {
      console.error('❌ Delete Room API Error:', error)
      throw error
    }
  },

  // Bookings management
  getBookings: async (filters = {}) => {
    try {
      console.log('🚀 API Request: GET /admin/bookings')
      const response = await api.get('/admin/bookings', { params: filters })
      console.log('✅ API Response:', response.status, '/admin/bookings')
      return response.data
    } catch (error) {
      console.error('❌ Admin Bookings API Error:', error)
      throw error
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      console.log('🚀 API Request: PATCH /admin/bookings/' + bookingId + '/status')
      const response = await api.patch(`/admin/bookings/${bookingId}/status`, { status })
      console.log('✅ API Response:', response.status, '/admin/bookings/' + bookingId + '/status')
      return response.data
    } catch (error) {
      console.error('❌ Update Booking Status API Error:', error)
      throw error
    }
  },

  // Reviews management
  getReviews: async (filters = {}) => {
    try {
      console.log('🚀 API Request: GET /admin/reviews')
      const response = await api.get('/admin/reviews', { params: filters })
      console.log('✅ API Response:', response.status, '/admin/reviews')
      return response.data
    } catch (error) {
      console.error('❌ Admin Reviews API Error:', error)
      throw error
    }
  },

  deleteReview: async (reviewId) => {
    try {
      console.log('🚀 API Request: DELETE /admin/reviews/' + reviewId)
      const response = await api.delete(`/admin/reviews/${reviewId}`)
      console.log('✅ API Response:', response.status, '/admin/reviews/' + reviewId)
      return response.data
    } catch (error) {
      console.error('❌ Delete Review API Error:', error)
      throw error
    }
  },

  // Promotions management
  getPromotions: async () => {
    try {
      console.log('🚀 API Request: GET /admin/promotions')
      const response = await api.get('/admin/promotions')
      console.log('✅ API Response:', response.status, '/admin/promotions')
      return response.data
    } catch (error) {
      console.error('❌ Admin Promotions API Error:', error)
      throw error
    }
  },

  createPromotion: async (promotionData) => {
    try {
      console.log('🚀 API Request: POST /admin/promotions')
      const response = await api.post('/admin/promotions', promotionData)
      console.log('✅ API Response:', response.status, '/admin/promotions')
      return response.data
    } catch (error) {
      console.error('❌ Create Promotion API Error:', error)
      throw error
    }
  },

  updatePromotion: async (promotionId, promotionData) => {
    try {
      console.log('🚀 API Request: PUT /admin/promotions/' + promotionId)
      const response = await api.put(`/admin/promotions/${promotionId}`, promotionData)
      console.log('✅ API Response:', response.status, '/admin/promotions/' + promotionId)
      return response.data
    } catch (error) {
      console.error('❌ Update Promotion API Error:', error)
      throw error
    }
  },

  deletePromotion: async (promotionId) => {
    try {
      console.log('🚀 API Request: DELETE /admin/promotions/' + promotionId)
      const response = await api.delete(`/admin/promotions/${promotionId}`)
      console.log('✅ API Response:', response.status, '/admin/promotions/' + promotionId)
      return response.data
    } catch (error) {
      console.error('❌ Delete Promotion API Error:', error)
      throw error
    }
  },

  // Guest services management
  getGuestServices: async () => {
    try {
      console.log('🚀 API Request: GET /admin/services')
      const response = await api.get('/admin/services')
      console.log('✅ API Response:', response.status, '/admin/services')
      return response.data
    } catch (error) {
      console.error('❌ Admin Guest Services API Error:', error)
      throw error
    }
  },

  createGuestService: async (serviceData) => {
    try {
      console.log('🚀 API Request: POST /admin/services')
      const response = await api.post('/admin/services', serviceData)
      console.log('✅ API Response:', response.status, '/admin/services')
      return response.data
    } catch (error) {
      console.error('❌ Create Guest Service API Error:', error)
      throw error
    }
  },

  // Room maintenance management
  getMaintenanceRecords: async () => {
    try {
      console.log('🚀 API Request: GET /admin/maintenance')
      const response = await api.get('/admin/maintenance')
      console.log('✅ API Response:', response.status, '/admin/maintenance')
      return response.data
    } catch (error) {
      console.error('❌ Admin Maintenance API Error:', error)
      throw error
    }
  },

  createMaintenanceRecord: async (maintenanceData) => {
    try {
      console.log('🚀 API Request: POST /admin/maintenance')
      const response = await api.post('/admin/maintenance', maintenanceData)
      console.log('✅ API Response:', response.status, '/admin/maintenance')
      return response.data
    } catch (error) {
      console.error('❌ Create Maintenance API Error:', error)
      throw error
    }
  },

  updateMaintenanceStatus: async (maintenanceId, status) => {
    try {
      console.log('🚀 API Request: PUT /admin/maintenance/' + maintenanceId + '/status')
      const response = await api.put(`/admin/maintenance/${maintenanceId}/status`, { status })
      console.log('✅ API Response:', response.status, '/admin/maintenance/' + maintenanceId + '/status')
      return response.data
    } catch (error) {
      console.error('❌ Update Maintenance Status API Error:', error)
      throw error
    }
  }
}

export default adminAPI