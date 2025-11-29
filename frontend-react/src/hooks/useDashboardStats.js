import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getDashboardStats,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 3, // Tambahkan retry
    retryDelay: 1000,
  });
};