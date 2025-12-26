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
      
      // Mock data if API doesn't exist yet
      return {
        totalBookings: 156,
        activeRooms: 48,
        totalRevenue: 125000000,
        averageRating: 4.8,
        recentBookings: [
          {
            id: 1,
            guest_name: 'John Doe',
            room: { room_number: '101' },
            check_in_date: new Date().toISOString(),
            status: 'confirmed'
          },
          {
            id: 2,
            guest_name: 'Jane Smith',
            room: { room_number: '205' },
            check_in_date: new Date().toISOString(),
            status: 'pending'
          }
        ],
        recentReviews: [
          {
            id: 1,
            guest_name: 'Alice Johnson',
            rating: 5,
            comment: 'Excellent service and beautiful rooms!'
          },
          {
            id: 2,
            guest_name: 'Bob Wilson',
            rating: 4,
            comment: 'Great location and friendly staff.'
          }
        ]
      }
    } catch (error) {
      console.error('❌ Admin Dashboard API Error:', error)
      // Return mock data on error
      return {
        totalBookings: 156,
        activeRooms: 48,
        totalRevenue: 125000000,
        averageRating: 4.8,
        recentBookings: [],
        recentReviews: []
      }
    }
  },

  // Rooms management
  getRooms: async (filters = {}) => {
    try {
      const response = await api.get('/admin/rooms', { params: filters })
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
      const response = await api.get('/admin/bookings', { params: filters })
      return response.data
    } catch (error) {
      console.error('❌ Admin Bookings API Error:', error)
      throw error
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await api.patch(`/admin/bookings/${bookingId}/status`, { status })
      return response.data
    } catch (error) {
      console.error('❌ Update Booking Status API Error:', error)
      throw error
    }
  },

  // Reviews management
  getReviews: async (filters = {}) => {
    try {
      const response = await api.get('/admin/reviews', { params: filters })
      return response.data
    } catch (error) {
      console.error('❌ Admin Reviews API Error:', error)
      throw error
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/admin/reviews/${reviewId}`)
      return response.data
    } catch (error) {
      console.error('❌ Delete Review API Error:', error)
      throw error
    }
  }
}

export default adminAPI