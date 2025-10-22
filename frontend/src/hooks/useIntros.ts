import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { introsService } from '@/services/api';
import { toast } from 'sonner';

export function useReceivedIntros() {
  return useQuery({
    queryKey: ['intros', 'received'],
    queryFn: () => introsService.getReceived(),
  });
}

export function useSentIntros() {
  return useQuery({
    queryKey: ['intros', 'sent'],
    queryFn: () => introsService.getSent(),
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
