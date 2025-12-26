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
      console.log('🚀 API Request: GET /bookings/member')
      const response = await api.get('/bookings/member')
      console.log('✅ API Response:', response.status, '/bookings/member')
      return response.data
    } catch (error) {
      console.error('❌ Member Bookings API Error:', error)
      
      // Return mock data for development
      return [
        {
          id: 1,
          room: {
            id: 1,
            name: 'Deluxe Ocean View',
            room_number: '101',
            room_type: { name: 'Deluxe' },
            image_url: '/hotel1.jpeg'
          },
          check_in_date: '2024-01-15',
          check_out_date: '2024-01-18',
          number_of_guests: 2,
          total_amount: 2500000,
          status: 'confirmed',
          special_requests: 'Late check-in requested',
          rating: null
        },
        {
          id: 2,
          room: {
            id: 2,
            name: 'Presidential Suite',
            room_number: '501',
            room_type: { name: 'Suite' },
            image_url: '/hotel2.jpeg'
          },
          check_in_date: '2024-02-10',
          check_out_date: '2024-02-12',
          number_of_guests: 4,
          total_amount: 5000000,
          status: 'pending',
          special_requests: null,
          rating: null
        },
        {
          id: 3,
          room: {
            id: 3,
            name: 'Standard Room',
            room_number: '205',
            room_type: { name: 'Standard' },
            image_url: '/hotel3.jpeg'
          },
          check_in_date: '2023-12-20',
          check_out_date: '2023-12-23',
          number_of_guests: 1,
          total_amount: 1200000,
          status: 'confirmed',
          special_requests: 'Quiet room preferred',
          rating: 5
        }
      ]
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
  }
}

export default bookingsAPI