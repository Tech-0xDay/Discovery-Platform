/**
 * Prefetch Hook - Loads all critical data in background on app mount
 * Makes navigation feel instant by preloading feed, leaderboards, etc.
 */
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { projectsService, leaderboardService, introsService } from '@/services/api';

// Get backend URL
const getBackendUrl = (): string => {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDev = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
  return isDev ? 'http://localhost:5000' : 'https://discovery-platform.onrender.com';
};

export function usePrefetch() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const startTime = performance.now();

    // Prefetch all critical data in parallel
    const prefetchData = async () => {
      try {
        // Prefetch feed pages (trending, newest, top-rated)
        const feedPromises = [
          // Trending - pages 1-2
          queryClient.prefetchQuery({
            queryKey: ['projects', 'hot', 1],
            queryFn: async () => {
              const response = await projectsService.getAll('hot', 1);
              return response.data;
            },
            staleTime: 1000 * 60 * 15,
          }),
          queryClient.prefetchQuery({
            queryKey: ['projects', 'hot', 2],
            queryFn: async () => {
              const response = await projectsService.getAll('hot', 2);
              return response.data;
            },
            staleTime: 1000 * 60 * 15,
          }),

          // Newest - page 1
          queryClient.prefetchQuery({
            queryKey: ['projects', 'new', 1],
            queryFn: async () => {
              const response = await projectsService.getAll('new', 1);
              return response.data;
            },
            staleTime: 1000 * 60 * 15,
          }),

          // Top Rated - page 1
          queryClient.prefetchQuery({
            queryKey: ['projects', 'top', 1],
            queryFn: async () => {
              const response = await projectsService.getAll('top', 1);
              return response.data;
            },
            staleTime: 1000 * 60 * 15,
          }),
        ];

        // Prefetch leaderboards
        const leaderboardPromises = [
          queryClient.prefetchQuery({
            queryKey: ['leaderboard', 'projects', 50],
            queryFn: async () => {
              const response = await leaderboardService.getProjects(50);
              return response.data.data || [];
            },
            staleTime: 1000 * 60 * 15,
          }),
          queryClient.prefetchQuery({
            queryKey: ['leaderboard', 'builders', 50],
            queryFn: async () => {
              const response = await leaderboardService.getBuilders(50);
              return response.data.data || [];
            },
            staleTime: 1000 * 60 * 15,
          }),
        ];

        // Prefetch intros and messages (for logged-in users)
        const token = localStorage.getItem('token');
        const userDataPromises = token ? [
          // Prefetch received intros
          queryClient.prefetchQuery({
            queryKey: ['intros', 'received'],
            queryFn: async () => {
              const response = await introsService.getReceived();
              return response.data;
            },
            staleTime: 1000 * 60 * 2,
          }),
          // Prefetch sent intros
          queryClient.prefetchQuery({
            queryKey: ['intros', 'sent'],
            queryFn: async () => {
              const response = await introsService.getSent();
              return response.data;
            },
            staleTime: 1000 * 60 * 2,
          }),
          // Prefetch message conversations
          queryClient.prefetchQuery({
            queryKey: ['messages', 'conversations'],
            queryFn: async () => {
              const backendUrl = getBackendUrl();
              const response = await fetch(`${backendUrl}/api/messages/conversations`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              const data = await response.json();
              return data.status === 'success' ? data.data : [];
            },
            staleTime: 1000 * 30,
          }),
        ] : [];

        // Execute all prefetches in parallel (non-blocking)
        // Use Promise.allSettled to prevent one failure from blocking others
        const results = await Promise.allSettled([
          ...feedPromises,
          ...leaderboardPromises,
          ...userDataPromises,
        ]);

        // Log results for diagnostics
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`[Prefetch] Completed in ${duration}ms`);
        console.log(`[Prefetch] Successful: ${successful}, Failed: ${failed}`);

        if (failed > 0) {
          console.warn('[Prefetch] Some requests failed, but app will continue normally');
        }
      } catch (error) {
        // Silent fail - prefetch errors shouldn't break the app
        console.error('[Prefetch] Error during prefetch:', error);
      }
    };

    // Start prefetch immediately
    prefetchData();
  }, [queryClient]);

  // This hook doesn't return anything - it just runs in the background
}
