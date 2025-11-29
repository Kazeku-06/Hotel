import api from '../api/axios';

export const dashboardService = {
  async getDashboardStats() {
    console.log('🔄 Fetching dashboard stats from API...');
    try {
      const response = await api.get('/admin/dashboard/stats');
      console.log('📊 Full API Response:', response);
      console.log('📊 Response data:', response.data);
      console.log('📊 Response data.data:', response.data.data);
      
      // Cek struktur response dan sesuaikan
      const statsData = response.data.data || response.data;
      console.log('📊 Final stats data:', statsData);
      
      return statsData;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      console.error('❌ Error response:', error.response);
      throw error;
    }
  },
};