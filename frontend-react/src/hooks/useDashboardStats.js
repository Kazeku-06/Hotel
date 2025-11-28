import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getDashboardStats,
    refetchInterval: 30000,
    staleTime: 10000,
    onError: (error) => {
      console.error('❌ useDashboardStats error:', error);
    },
    onSuccess: (data) => {
      console.log('✅ useDashboardStats success:', data);
    }
  });
};