import { useQuery } from '@tanstack/react-query';
import { searchService, leaderboardService } from '@/services/api';

export function useSearch(query: string, type?: string) {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => searchService.search(query, type),
    enabled: !!query,
  });
}

export function useLeaderboardProjects(timeframe: string = 'month') {
  return useQuery({
    queryKey: ['leaderboard', 'projects', timeframe],
    queryFn: () => leaderboardService.getProjects(timeframe),
  });
}

export function useLeaderboardBuilders(timeframe: string = 'month') {
  return useQuery({
    queryKey: ['leaderboard', 'builders', timeframe],
    queryFn: () => leaderboardService.getBuilders(timeframe),
  });
}

export function useLeaderboardFeatured() {
  return useQuery({
    queryKey: ['leaderboard', 'featured'],
    queryFn: () => leaderboardService.getFeatured(),
  });
}
