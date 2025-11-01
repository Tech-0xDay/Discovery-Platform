import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '@/services/api';
import { toast } from 'sonner';

// Transform backend comment data to frontend format
function transformComment(backendComment: any) {
  return {
    id: backendComment.id,
    content: backendComment.content,
    projectId: backendComment.project_id,
    authorId: backendComment.user_id,
    author: backendComment.commenter ? {
      id: backendComment.commenter.id,
      username: backendComment.commenter.username,
      email: backendComment.commenter.email || '',
      displayName: backendComment.commenter.display_name,
      avatar: backendComment.commenter.avatar_url,
      bio: backendComment.commenter.bio,
      isVerified: backendComment.commenter.email_verified || false,
      isAdmin: backendComment.commenter.is_admin || false,
      walletAddress: backendComment.commenter.wallet_address,
      createdAt: backendComment.commenter.created_at,
      updatedAt: backendComment.commenter.updated_at || backendComment.commenter.created_at,
    } : {
      id: backendComment.user_id,
      username: 'Unknown',
      email: '',
      isVerified: false,
      isAdmin: false,
      createdAt: '',
      updatedAt: '',
    },
    upvotes: backendComment.upvotes || 0,
    downvotes: backendComment.downvotes || 0,
    createdAt: backendComment.created_at,
    updatedAt: backendComment.updated_at,
  };
}

export function useComments(projectId: string) {
  return useQuery({
    queryKey: ['comments', projectId],
    queryFn: async () => {
      const response = await commentsService.getByProject(projectId);

      // Transform the comments data
      return {
        ...response.data,
        data: response.data.data?.map(transformComment) || [],
      };
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // Comments stay fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchInterval: false, // NO polling - Socket.IO handles invalidation
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always', // Always check for fresh data
    placeholderData: (previousData) => previousData, // Keep old data visible
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

