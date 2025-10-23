import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '@/services/api';
import { toast } from 'sonner';

export function useComments(projectId: string) {
  return useQuery({
    queryKey: ['comments', projectId],
    queryFn: () => commentsService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateComment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => commentsService.create({ ...data, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Comment posted!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    },
  });
}

export function useUpdateComment(commentId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => commentsService.update(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
      toast.success('Comment updated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update comment');
    },
  });
}

export function useDeleteComment(commentId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => commentsService.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
      toast.success('Comment deleted!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    },
  });
}

export function useVoteComment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, voteType }: { commentId: string; voteType: 'up' | 'down' }) =>
      commentsService.vote(commentId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
      toast.success('Vote added!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to vote on comment');
    },
  });
}

