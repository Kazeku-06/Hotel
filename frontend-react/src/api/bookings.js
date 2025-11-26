// api/bookings.js
import api from './axios'

export const bookingsAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/me'),
}

// Tambahkan debug di axios interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.data)
    return Promise.reject(error)
  }
)