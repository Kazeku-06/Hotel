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

export const enhancedAPI = {
  // Room Availability Calendar
  checkRoomAvailability: async (checkIn, checkOut, roomTypeId = null) => {
    try {
      console.log('🚀 API Request: GET /rooms/availability')
      const params = { check_in: checkIn, check_out: checkOut }
      if (roomTypeId) params.room_type_id = roomTypeId
      
      const response = await api.get('/rooms/availability', { params })
      console.log('✅ API Response:', response.status, '/rooms/availability')
      return response.data
    } catch (error) {
      console.error('❌ Room Availability API Error:', error)
      throw error
    }
  },

  // Promotions
  getActivePromotions: async () => {
    try {
      console.log('🚀 API Request: GET /promotions')
      const response = await api.get('/promotions')
      console.log('✅ API Response:', response.status, '/promotions')
      return response.data
    } catch (error) {
      console.error('❌ Promotions API Error:', error)
      throw error
    }
  },

  // Admin Promotions
  getAdminPromotions: async () => {
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
      console.log('✅ API Response:', response.status, `/admin/promotions/${promotionId}`)
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
      console.log('✅ API Response:', response.status, `/admin/promotions/${promotionId}`)
      return response.data
    } catch (error) {
      console.error('❌ Delete Promotion API Error:', error)
      throw error
    }
  },

  // Guest Services
  getGuestServices: async () => {
    try {
      console.log('🚀 API Request: GET /services')
      const response = await api.get('/services')
      console.log('✅ API Response:', response.status, '/services')
      return response.data
    } catch (error) {
      console.error('❌ Guest Services API Error:', error)
      throw error
    }
  },

  // Admin Services
  getAdminServices: async () => {
    try {
      console.log('🚀 API Request: GET /admin/services')
      const response = await api.get('/admin/services')
      console.log('✅ API Response:', response.status, '/admin/services')
      return response.data
    } catch (error) {
      console.error('❌ Admin Services API Error:', error)
      throw error
    }
  },

  createService: async (serviceData) => {
    try {
      console.log('🚀 API Request: POST /admin/services')
      const response = await api.post('/admin/services', serviceData)
      console.log('✅ API Response:', response.status, '/admin/services')
      return response.data
    } catch (error) {
      console.error('❌ Create Service API Error:', error)
      throw error
    }
  },

  // Room Maintenance
  getMaintenanceRecords: async () => {
    try {
      console.log('🚀 API Request: GET /admin/maintenance')
      const response = await api.get('/admin/maintenance')
      console.log('✅ API Response:', response.status, '/admin/maintenance')
      return response.data
    } catch (error) {
      console.error('❌ Maintenance API Error:', error)
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
      console.log('✅ API Response:', response.status, `/admin/maintenance/${maintenanceId}/status`)
      return response.data
    } catch (error) {
      console.error('❌ Update Maintenance Status API Error:', error)
      throw error
    }
  },

  // Notifications
  getUserNotifications: async () => {
    try {
      console.log('🚀 API Request: GET /notifications')
      const response = await api.get('/notifications')
      console.log('✅ API Response:', response.status, '/notifications')
      return response.data
    } catch (error) {
      console.error('❌ Notifications API Error:', error)
      throw error
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      console.log('🚀 API Request: PUT /notifications/' + notificationId + '/read')
      const response = await api.put(`/notifications/${notificationId}/read`)
      console.log('✅ API Response:', response.status, `/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      console.error('❌ Mark Notification Read API Error:', error)
      throw error
    }
  },

  // Booking Services
  getBookingServices: async (bookingId) => {
    try {
      console.log('🚀 API Request: GET /bookings/' + bookingId + '/services')
      const response = await api.get(`/bookings/${bookingId}/services`)
      console.log('✅ API Response:', response.status, `/bookings/${bookingId}/services`)
      return response.data
    } catch (error) {
      console.error('❌ Booking Services API Error:', error)
      throw error
    }
  },

  addServiceToBooking: async (bookingId, serviceData) => {
    try {
      console.log('🚀 API Request: POST /bookings/' + bookingId + '/services')
      const response = await api.post(`/bookings/${bookingId}/services`, serviceData)
      console.log('✅ API Response:', response.status, `/bookings/${bookingId}/services`)
      return response.data
    } catch (error) {
      console.error('❌ Add Service to Booking API Error:', error)
      throw error
    }
  }
}

export default enhancedAPI