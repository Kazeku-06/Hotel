// dashboardService.js
import api from '../api/axios'; // Pastikan path ini benar

export const dashboardService = {
  async getDashboardStats() {
    console.log('🔄 Fetching dashboard stats from API...');
    try {
      const response = await api.get('/admin/dashboard/stats');
      console.log('📊 Full API Response:', response);
      console.log('📊 Response data:', response.data);
      console.log('📊 Response data.data:', response.data.data);
      
      // Ambil data dari API
      const apiData = response.data.data || response.data;
      console.log('📊 Raw API data:', apiData);
      
      // Mapping property names dari API ke frontend
      const mappedData = {
        total_rooms: apiData.total_rooms || 0,
        active_bookings: apiData.active_bookings || apiData.total_bookings || 0,
        user_reviews: apiData.user_reviews || apiData.total_reviews || 0,
        revenue: apiData.revenue || apiData.total_revenue || 0,
        
        // Data tambahan dari API
        available_rooms: apiData.available_rooms || 0,
        pending_bookings: apiData.pending_bookings || 0,
        today_checkins: apiData.today_checkins || 0,
        today_checkouts: apiData.today_checkouts || 0,
        total_bookings: apiData.total_bookings || 0,
        average_rating: apiData.average_rating || 0
      };
      
      console.log('📊 Mapped stats data:', mappedData);
      return mappedData;
      
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      console.error('❌ Error response:', error.response);
      throw error;
    }
  },
};