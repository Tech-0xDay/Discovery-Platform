import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { badgesService } from '@/services/api';
import { toast } from 'sonner';

export function useBadges(projectId: string) {
  return useQuery({
    queryKey: ['badges', projectId],
    queryFn: () => badgesService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useAwardBadge(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => badgesService.award({ ...data, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Badge awarded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to award badge');
    },
  });
}
