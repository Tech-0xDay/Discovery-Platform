import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { votesService } from '@/services/api';
import { toast } from 'sonner';

export function useVote(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voteType: 'up' | 'down') => votesService.vote(projectId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to vote');
    },
  });
}

export function useUserVotes() {
  return useQuery({
    queryKey: ['userVotes'],
    queryFn: async () => {
      const response = await votesService.getUserVotes();
      return response.data?.data || [];
    },
  });
}

// Legacy exports for backward compatibility
export function useUpvote(projectId: string) {
  const voteMutation = useVote(projectId);
  return {
    ...voteMutation,
    mutate: () => voteMutation.mutate('up'),
  };
}

export function useDownvote(projectId: string) {
  const voteMutation = useVote(projectId);
  return {
    ...voteMutation,
    mutate: () => voteMutation.mutate('down'),
  };
}

export function useRemoveVote(projectId: string) {
  const voteMutation = useVote(projectId);
  // Remove vote is same as clicking the same vote type again (handled by backend)
  return voteMutation;
}
