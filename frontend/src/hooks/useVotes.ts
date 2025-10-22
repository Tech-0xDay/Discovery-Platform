import { useMutation, useQueryClient } from '@tanstack/react-query';
import { votesService } from '@/services/api';
import { toast } from 'sonner';

export function useUpvote(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => votesService.upvote(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upvote');
    },
  });
}

export function useDownvote(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => votesService.downvote(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to downvote');
    },
  });
}

export function useRemoveVote(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => votesService.removeVote(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove vote');
    },
  });
}
