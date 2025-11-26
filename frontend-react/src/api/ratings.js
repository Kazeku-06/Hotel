import api from './axios'

export const ratingsAPI = {
  createRating: (data) => api.post('/ratings', data),
  getRatings: () => api.get('/ratings'),
}