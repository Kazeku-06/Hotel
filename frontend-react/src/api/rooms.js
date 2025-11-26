import api from './axios'

export const roomsAPI = {
  getRooms: (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    return api.get(`/rooms?${params}`)
  },
  getRoom: (id) => api.get(`/rooms/${id}`),
  getRoomTypes: () => api.get('/admin/room-types'), // TAMBAHKAN INI
  createRoom: (data) => api.post('/admin/rooms', data),
  updateRoom: (id, data) => api.put(`/admin/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/admin/rooms/${id}`),
}