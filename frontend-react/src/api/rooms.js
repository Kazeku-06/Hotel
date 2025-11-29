import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Create axios instance with CORS configuration
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: false, // ❌ SET TO FALSE - ini penyebab masalah
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Room Types API
export const roomTypesAPI = {
  getRoomTypes: () => apiClient.get('/room-types'),
  createRoomType: (data) => apiClient.post('/admin/room-types', data),
  getAdminRoomTypes: () => apiClient.get('/admin/room-types')
};

export const roomsAPI = {
  // Public endpoints
  getRooms: (filters = {}) => {
    console.log('🔍 FILTERS SENT TO API:', filters);
    
    const params = {};
    
    if (filters.room_type) params.room_type = filters.room_type;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.capacity) params.capacity = filters.capacity;
    
    if (filters.facilities && filters.facilities.length > 0) {
      params.facilities = filters.facilities;
    }
    
    console.log('🔍 FINAL API PARAMS:', params);
    
    return apiClient.get('/rooms', { params });
  },
  
  getRoom: (id) => apiClient.get(`/rooms/${id}`),
  
  // Admin endpoints
  getAdminRooms: () => apiClient.get('/admin/rooms'),
  createRoomWithPhotos: (formData) => apiClient.post('/admin/rooms', formData),
  updateRoomWithPhotos: (id, formData) => apiClient.put(`/admin/rooms/${id}`, formData),
  deleteRoom: (id) => apiClient.delete(`/admin/rooms/${id}`),
  deleteRoomPhoto: (roomId, photoId) => apiClient.delete(`/admin/rooms/${roomId}/photos/${photoId}`),

  // Facilities API
  getFacilities: () => apiClient.get('/facilities'),
  getAdminFacilities: () => apiClient.get('/admin/facilities'),
  createFacility: (data) => apiClient.post('/admin/facilities', data),
  getRoomFacilities: (roomId) => apiClient.get(`/admin/rooms/${roomId}/facilities`),
  addRoomFacility: (roomId, facilityId) => apiClient.post(`/admin/rooms/${roomId}/facilities`, { facility_id: facilityId }),
  removeRoomFacility: (roomId, facilityId) => apiClient.delete(`/admin/rooms/${roomId}/facilities?facility_id=${facilityId}`)
};

export const facilitiesAPI = {
  getFacilities: () => apiClient.get('/facilities'),
  getAdminFacilities: () => apiClient.get('/admin/facilities'),
  createFacility: (data) => apiClient.post('/admin/facilities', data),
};

export default apiClient;