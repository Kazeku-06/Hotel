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

// Room Types API
export const roomTypesAPI = {
  // Get all room types - PUBLIC
  getRoomTypes: () => {
    return apiClient.get('/room-types')
  },

  // Create new room type - ADMIN ONLY
  createRoomType: (data) => {
    const token = localStorage.getItem('token');
    console.log('🔐 DEBUG - Token for room type creation:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return Promise.reject(new Error('No authentication token found. Please log in.'));
    }

    // 🔥 PERBAIKAN: Gunakan endpoint yang benar - /room-types (bukan /admin/room-types)
    return apiClient.post('/room-types', data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
  }
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
    
    // Handle facilities array
    if (filters.facilities && filters.facilities.length > 0) {
      params['facilities[]'] = filters.facilities;
    }
    
    console.log('🔍 FINAL API PARAMS:', params);
    
    return apiClient.get('/rooms', { params });
  },
  
  getRoom: (id) => apiClient.get(`/rooms/${id}`),
  
  // Admin endpoints (require auth)
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

  // Room Types API
  getRoomTypes: roomTypesAPI.getRoomTypes,
  createRoomType: roomTypesAPI.createRoomType,

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