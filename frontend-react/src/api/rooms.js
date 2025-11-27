import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Request interceptor untuk menambahkan token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const roomsAPI = {
  // Untuk public rooms (tanpa auth) - GET SINGLE ROOM
  getRoom: (id) => apiClient.get(`/rooms/${id}`),
  
  // Untuk public rooms (tanpa auth) - GET ALL ROOMS
  getRooms: () => apiClient.get('/rooms'),
  
  // Untuk admin rooms (dengan auth)
  getAdminRooms: () => apiClient.get('/admin/rooms'),

  createRoomWithPhotos: (formData) => {
    return apiClient.post('/admin/rooms', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  updateRoomWithPhotos: (id, formData) => {
    return apiClient.put(`/admin/rooms/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  deleteRoom: (id) => apiClient.delete(`/admin/rooms/${id}`),

  deleteRoomPhoto: (roomId, photoId) => 
    apiClient.delete(`/admin/rooms/${roomId}/photos/${photoId}`),

  // Facilities API
  getFacilities: () => apiClient.get('/facilities'),
  
  getAdminFacilities: () => apiClient.get('/admin/facilities'),
  
  createFacility: (data) => apiClient.post('/admin/facilities', data),
  
  getRoomFacilities: (roomId) => apiClient.get(`/admin/rooms/${roomId}/facilities`),
  
  addRoomFacility: (roomId, facilityId) => 
    apiClient.post(`/admin/rooms/${roomId}/facilities`, { facility_id: facilityId }),
  
  removeRoomFacility: (roomId, facilityId) => 
    apiClient.delete(`/admin/rooms/${roomId}/facilities?facility_id=${facilityId}`)
};

export const facilitiesAPI = {
  getFacilities: () => apiClient.get('/facilities'),
  getAdminFacilities: () => apiClient.get('/admin/facilities'),
  createFacility: (data) => apiClient.post('/admin/facilities', data),
};