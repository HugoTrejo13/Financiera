import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface Space {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
}

export interface InvestmentPlan {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  expected_return_rate: number;
  target_date: string;
  icon: string;
  color: string;
  space_id: number | null;
  owner_id: number | null;
  created_at: string;
}

export const useSpaces = () => {
  const queryClient = useQueryClient();

  const { data: spaces = [], isLoading: loadingSpaces } = useQuery<Space[]>({
    queryKey: ['spaces'],
    queryFn: async () => {
      const response = await api.get('/spaces/');
      return response.data;
    },
  });

  const createSpace = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post('/spaces/', { name });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  });

  const inviteToSpace = useMutation({
    mutationFn: async ({ spaceId, email }: { spaceId: number; email: string }) => {
      const response = await api.post(`/spaces/${spaceId}/invite?email=${encodeURIComponent(email)}`);
      return response.data;
    },
  });

  return { spaces, loadingSpaces, createSpace, inviteToSpace };
};

export const useInvestments = () => {
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading: loadingPlans } = useQuery<InvestmentPlan[]>({
    queryKey: ['investments'],
    queryFn: async () => {
      const response = await api.get('/investments/');
      return response.data;
    },
  });

  const createPlan = useMutation({
    mutationFn: async (planData: Partial<InvestmentPlan>) => {
      const response = await api.post('/investments/', planData);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['investments'] }),
  });

  const contribute = useMutation({
    mutationFn: async ({ planId, amount }: { planId: number; amount: number }) => {
      const response = await api.post(`/investments/${planId}/contribute`, { amount });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['investments'] }),
  });

  return { plans, loadingPlans, createPlan, contribute };
};
