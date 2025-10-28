import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '@/services/api';

// Transform backend project data
function transformProject(backendProject: any) {
  return {
    id: backendProject.id,
    rank: backendProject.rank,
    title: backendProject.title,
    tagline: backendProject.tagline || '',
    score: backendProject.upvotes || 0,
    author: backendProject.creator ? {
      id: backendProject.creator.id,
      username: backendProject.creator.username,
      avatar: backendProject.creator.avatar_url,
    } : {
      id: backendProject.user_id,
      username: 'Unknown',
      avatar: '',
    },
  };
}

// Transform backend user data
function transformBuilder(backendUser: any) {
  return {
    rank: backendUser.rank,
    id: backendUser.id,
    username: backendUser.username,
    avatar: backendUser.avatar_url,
    score: backendUser.karma || 0,
    projects: backendUser.project_count || 0,
  };
}

export function useProjectsLeaderboard(limit: number = 50) {
  return useQuery({
    queryKey: ['leaderboard', 'projects', limit],
    queryFn: async () => {
      const response = await leaderboardService.getProjects(limit);
      return response.data.data?.map(transformProject) || [];
    },
    staleTime: 1000 * 60 * 15, // 15 min - leaderboards don't change often
    gcTime: 1000 * 60 * 60,    // 1 hour in cache

    // Background refetch for leaderboards
    refetchInterval: 1000 * 60, // Auto-refresh every 60 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

export function useBuildersLeaderboard(limit: number = 50) {
  return useQuery({
    queryKey: ['leaderboard', 'builders', limit],
    queryFn: async () => {
      const response = await leaderboardService.getBuilders(limit);
      return response.data.data?.map(transformBuilder) || [];
    },
    staleTime: 1000 * 60 * 15, // 15 min - leaderboards don't change often
    gcTime: 1000 * 60 * 60,    // 1 hour in cache

    // Background refetch for builders leaderboard
    refetchInterval: 1000 * 60, // Auto-refresh every 60 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}
