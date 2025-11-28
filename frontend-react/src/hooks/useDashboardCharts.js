import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const useDashboardCharts = () => {
  return useQuery({
    queryKey: ['dashboardCharts'],
    queryFn: dashboardService.getDashboardCharts,
    refetchInterval: 60000, // Auto-refresh every 1 minute
    staleTime: 30000, //
  });
};