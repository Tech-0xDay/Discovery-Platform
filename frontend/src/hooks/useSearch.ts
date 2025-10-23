import { useQuery } from '@tanstack/react-query';
import { searchService, leaderboardService } from '@/services/api';

export function useSearch(query: string, type?: string) {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => searchService.search(query, type),
    enabled: !!query,
    staleTime: 1000 * 60 * 5, // Search results stay fresh for 5 minutes
    gcTime: 1000 * 60 * 15, // Keep in cache for 15 minutes
  });
}

export function useLeaderboardProjects(timeframe: string = 'month') {
  return useQuery({
    queryKey: ['leaderboard', 'projects', timeframe],
    queryFn: () => leaderboardService.getProjects(timeframe),
    staleTime: 1000 * 60 * 10, // Leaderboard data stays fresh for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}

export function useLeaderboardBuilders(timeframe: string = 'month') {
  return useQuery({
    queryKey: ['leaderboard', 'builders', timeframe],
    queryFn: () => leaderboardService.getBuilders(timeframe),
    staleTime: 1000 * 60 * 10, // Leaderboard data stays fresh for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}

export function useLeaderboardFeatured() {
  return useQuery({
    queryKey: ['leaderboard', 'featured'],
    queryFn: () => leaderboardService.getFeatured(),
    staleTime: 1000 * 60 * 10, // Featured projects stay fresh for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}
