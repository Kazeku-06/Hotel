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
      
      // Return mock data for development
      return [
        {
          id: 1,
          room_number: '101',
          name: 'Deluxe Ocean View',
          room_type: { name: 'Deluxe' },
          capacity: 2,
          price_no_breakfast: 1500000,
          price_with_breakfast: 1800000,
          description: 'Spacious room with stunning ocean views and modern amenities.',
          facilities: ['WiFi', 'AC', 'TV', 'Bathroom'],
          status: 'available',
          image_url: '/hotel1.jpeg'
        },
        {
          id: 2,
          room_number: '205',
          name: 'Presidential Suite',
          room_type: { name: 'Suite' },
          capacity: 4,
          price_no_breakfast: 3500000,
          price_with_breakfast: 4000000,
          description: 'Luxurious suite with separate living area and premium amenities.',
          facilities: ['WiFi', 'AC', 'TV', 'Bathroom', 'Coffee', 'Parking'],
          status: 'available',
          image_url: '/hotel2.jpeg'
        },
        {
          id: 3,
          room_number: '302',
          name: 'Standard Room',
          room_type: { name: 'Standard' },
          capacity: 2,
          price_no_breakfast: 800000,
          price_with_breakfast: 1000000,
          description: 'Comfortable standard room with essential amenities.',
          facilities: ['WiFi', 'AC', 'TV'],
          status: 'occupied',
          image_url: '/hotel3.jpeg'
        }
      ]
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
      
      // Return mock data for development
      return [
        {
          id: 1,
          guest_name: 'John Doe',
          room: {
            id: 1,
            room_number: '101',
            name: 'Deluxe Ocean View',
            room_type: { name: 'Deluxe' },
            image_url: '/hotel1.jpeg'
          },
          check_in_date: '2024-01-15',
          check_out_date: '2024-01-18',
          number_of_guests: 2,
          total_amount: 4500000,
          status: 'confirmed',
          special_requests: 'Late check-in requested'
        },
        {
          id: 2,
          guest_name: 'Jane Smith',
          room: {
            id: 2,
            room_number: '205',
            name: 'Presidential Suite',
            room_type: { name: 'Suite' },
            image_url: '/hotel2.jpeg'
          },
          check_in_date: '2024-02-10',
          check_out_date: '2024-02-12',
          number_of_guests: 4,
          total_amount: 8000000,
          status: 'pending',
          special_requests: null
        },
        {
          id: 3,
          guest_name: 'Bob Wilson',
          room: {
            id: 3,
            room_number: '302',
            name: 'Standard Room',
            room_type: { name: 'Standard' },
            image_url: '/hotel3.jpeg'
          },
          check_in_date: '2023-12-20',
          check_out_date: '2023-12-23',
          number_of_guests: 1,
          total_amount: 2400000,
          status: 'cancelled',
          special_requests: 'Quiet room preferred'
        }
      ]
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
      
      // Return mock data for development
      return [
        {
          id: 1,
          guest_name: 'Alice Johnson',
          rating: 5,
          comment: 'Excellent service and beautiful rooms! The staff was incredibly helpful and the amenities were top-notch. Will definitely stay here again.',
          room: {
            id: 1,
            room_number: '101',
            name: 'Deluxe Ocean View',
            room_type: { name: 'Deluxe' }
          },
          created_at: '2024-01-20T10:30:00Z'
        },
        {
          id: 2,
          guest_name: 'Bob Wilson',
          rating: 4,
          comment: 'Great location and friendly staff. The room was clean and comfortable. Only minor issue was the WiFi speed could be better.',
          room: {
            id: 2,
            room_number: '205',
            name: 'Presidential Suite',
            room_type: { name: 'Suite' }
          },
          created_at: '2024-01-18T14:15:00Z'
        },
        {
          id: 3,
          guest_name: 'Carol Davis',
          rating: 5,
          comment: 'Outstanding experience! The breakfast was amazing and the pool area was perfect for relaxation. Highly recommend this hotel.',
          room: {
            id: 3,
            room_number: '302',
            name: 'Standard Room',
            room_type: { name: 'Standard' }
          },
          created_at: '2024-01-15T09:45:00Z'
        },
        {
          id: 4,
          guest_name: 'David Brown',
          rating: 3,
          comment: 'Decent stay overall. The room was okay but could use some updates. Service was good though.',
          room: {
            id: 1,
            room_number: '101',
            name: 'Deluxe Ocean View',
            room_type: { name: 'Deluxe' }
          },
          created_at: '2024-01-12T16:20:00Z'
        },
        {
          id: 5,
          guest_name: 'Emma Taylor',
          rating: 2,
          comment: 'Room was not as clean as expected and the air conditioning was not working properly. Staff tried to help but the issue persisted.',
          room: {
            id: 3,
            room_number: '302',
            name: 'Standard Room',
            room_type: { name: 'Standard' }
          },
          created_at: '2024-01-10T11:30:00Z'
        }
      ]
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