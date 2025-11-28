import api from '../api/axios';

export const dashboardService = {
  async getDashboardStats() {
    console.log('🔄 Fetching dashboard stats from API...');
    try {
      const response = await api.get('/admin/dashboard/stats');
      console.log('✅ Dashboard stats response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  },
};