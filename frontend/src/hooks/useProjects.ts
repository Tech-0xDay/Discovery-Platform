import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/api';
import { toast } from 'sonner';

export function useProjects(sort: string = 'hot', page: number = 1) {
  return useQuery({
    queryKey: ['projects', sort, page],
    queryFn: () => projectsService.getAll(sort, page),
  });
}

export function useProjectById(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsService.getById(id),
    enabled: !!id,
  });
}

export function useUserProjects(userId: string) {
  return useQuery({
    queryKey: ['user-projects', userId],
    queryFn: () => projectsService.getByUser(userId),
    enabled: !!userId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      console.log('Creating project with data:', data);
      return projectsService.create(data);
    },
    onSuccess: (response) => {
      console.log('Project created successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
      toast.success('Project published successfully!');
    },
    onError: (error: any) => {
      console.error('Project creation error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to publish project';
      toast.error(errorMessage);
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => projectsService.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update project');
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectsService.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });
}
