import api from './axios'

export const ratingsAPI = {
  // For users to submit ratings
  createRating: (data) => api.post('/ratings', data),
  
  // For users to get their ratings
  getRatings: () => api.get('/ratings'),
  
  // For admin to get all ratings
  getAdminRatings: () => api.get('/admin/ratings'),
  
  // Get ratings for specific booking
  getBookingRatings: (bookingId) => api.get(`/ratings/booking/${bookingId}`),
  
  // NEW: Get all ratings for public view (no auth required)
  getPublicRatings: () => api.get('/ratings/public'),
}