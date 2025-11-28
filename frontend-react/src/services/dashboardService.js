import api from '../api/axios';

export const dashboardService = {
  async getDashboardStats() {
    console.log('🔄 Fetching dashboard stats from API...');
    try {
      // ✅ TAMBAHKAN /api di depan path
      const response = await api.get('/admin/dashboard/stats');
      console.log('✅ Dashboard stats response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  },

  async getDashboardCharts() {
    console.log('🔄 Fetching dashboard charts from API...');
    try {
      // ✅ TAMBAHKAN /api di depan path
      const response = await api.get('/admin/dashboard/charts');
      console.log('✅ Dashboard charts response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard charts:', error);
      throw error;
    }
  },
};