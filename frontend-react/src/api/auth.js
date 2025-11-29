import api from './axios'

export const authAPI = {
  // ✅ HAPUS /api dari sini, karena baseURL sudah include /api
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
}