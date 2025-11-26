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
}