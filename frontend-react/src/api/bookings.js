import api from './axios'

export const bookingsAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/me'),
}