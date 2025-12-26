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

export const bookingsAPI = {
  // Get member bookings
  getMemberBookings: async () => {
    try {
      console.log('🚀 API Request: GET /bookings/me')
      const response = await api.get('/bookings/me')
      console.log('✅ API Response:', response.status, '/bookings/me')
      
      // Transform the data to match frontend expectations
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data.map(booking => ({
          id: booking.id,
          room: {
            id: booking.booking_rooms[0]?.room_id || null,
            name: `${booking.booking_rooms[0]?.room_type || 'Room'} - ${booking.guest_name}`,
            room_number: booking.booking_rooms[0]?.room_id || 'N/A',
            room_type: { name: booking.booking_rooms[0]?.room_type || 'Standard' },
            image_url: '/hotel1.jpeg' // Default image
          },
          check_in_date: booking.check_in,
          check_out_date: booking.check_out,
          number_of_guests: booking.total_guests,
          total_amount: booking.total_price,
          status: booking.status,
          special_requests: null,
          rating: null,
          guest_name: booking.guest_name,
          phone: booking.phone,
          payment_method: booking.payment_method,
          created_at: booking.created_at
        }))
      }
      
      return []
    } catch (error) {
      console.error('❌ Member Bookings API Error:', error)
      throw error
    }
  },

  // Create new booking
  createBooking: async (bookingData) => {
    try {
      console.log('🚀 API Request: POST /bookings', bookingData)
      const response = await api.post('/bookings', bookingData)
      console.log('✅ API Response:', response.status, '/bookings')
      return response.data
    } catch (error) {
      console.error('❌ Create Booking API Error:', error)
      throw error
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      console.log('🚀 API Request: GET /bookings/' + bookingId)
      const response = await api.get(`/bookings/${bookingId}`)
      console.log('✅ API Response:', response.status, `/bookings/${bookingId}`)
      return response.data
    } catch (error) {
      console.error('❌ Get Booking API Error:', error)
      throw error
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      console.log('🚀 API Request: PATCH /bookings/' + bookingId + '/cancel')
      const response = await api.patch(`/bookings/${bookingId}/cancel`)
      console.log('✅ API Response:', response.status, `/bookings/${bookingId}/cancel`)
      return response.data
    } catch (error) {
      console.error('❌ Cancel Booking API Error:', error)
      throw error
    }
  },

  // Rate booking
  rateBooking: async (bookingId, rating, comment) => {
    try {
      console.log('🚀 API Request: POST /bookings/' + bookingId + '/rate')
      const response = await api.post(`/bookings/${bookingId}/rate`, {
        rating,
        comment
      })
      console.log('✅ API Response:', response.status, `/bookings/${bookingId}/rate`)
      return response.data
    } catch (error) {
      console.error('❌ Rate Booking API Error:', error)
      throw error
    }
  },

  // Get user notifications
  getNotifications: async () => {
    try {
      console.log('🚀 API Request: GET /notifications')
      const response = await api.get('/notifications')
      console.log('✅ API Response:', response.status, '/notifications')
      return response.data
    } catch (error) {
      console.error('❌ Get Notifications API Error:', error)
      throw error
    }
  },

  // Mark notification as read
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

  // Get active promotions
  getPromotions: async () => {
    try {
      console.log('🚀 API Request: GET /promotions')
      const response = await api.get('/promotions')
      console.log('✅ API Response:', response.status, '/promotions')
      return response.data
    } catch (error) {
      console.error('❌ Get Promotions API Error:', error)
      throw error
    }
  },

  // Get guest services
  getGuestServices: async () => {
    try {
      console.log('🚀 API Request: GET /services')
      const response = await api.get('/services')
      console.log('✅ API Response:', response.status, '/services')
      return response.data
    } catch (error) {
      console.error('❌ Get Guest Services API Error:', error)
      throw error
    }
  },

  // Check room availability
  checkRoomAvailability: async (checkIn, checkOut, roomTypeId = null) => {
    try {
      console.log('🚀 API Request: GET /rooms/availability')
      const params = { check_in: checkIn, check_out: checkOut }
      if (roomTypeId) params.room_type_id = roomTypeId
      
      const response = await api.get('/rooms/availability', { params })
      console.log('✅ API Response:', response.status, '/rooms/availability')
      return response.data
    } catch (error) {
      console.error('❌ Check Room Availability API Error:', error)
      throw error
    }
  }
}

export default bookingsAPI