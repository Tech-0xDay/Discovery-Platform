import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { introsService } from '@/services/api';
import { toast } from 'sonner';

export function useReceivedIntros() {
  return useQuery({
    queryKey: ['intros', 'received'],
    queryFn: () => introsService.getReceived(),
    staleTime: 1000 * 60 * 5, // Fresh for 5 minutes (Socket.IO handles real-time)
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchInterval: false, // NO polling - Socket.IO handles invalidation
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always', // Always check for fresh data
    placeholderData: (previousData) => previousData, // Keep old data visible
  });
}

export function useSentIntros() {
  return useQuery({
    queryKey: ['intros', 'sent'],
    queryFn: () => introsService.getSent(),
    staleTime: 1000 * 60 * 5, // Fresh for 5 minutes (Socket.IO handles real-time)
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchInterval: false, // NO polling - Socket.IO handles invalidation
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always', // Always check for fresh data
    placeholderData: (previousData) => previousData, // Keep old data visible
  });
}

export function useCreateIntro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => introsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intros', 'sent'] });
      toast.success('Intro request sent!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send intro request');
    },
  });
}

export function useAcceptIntro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => introsService.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intros', 'received'] });
      toast.success('Intro request accepted!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to accept intro');
    },
  });
}

export function useDeclineIntro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => introsService.decline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intros', 'received'] });
      toast.success('Intro request declined');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to decline intro');
    },
  });
}
