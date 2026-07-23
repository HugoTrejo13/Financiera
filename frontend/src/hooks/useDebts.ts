import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Category } from './useCategories';

export interface Debt {
  id: number;
  description: string;
  price: number;
  has_interest: boolean;
  interest_rate: number;
  months: number;
  total_amount: number;
  remaining_amount: number;
  monthly_payment: number;
  purchase_date: string;
  category: Category | null;
  category_id: number | null;
  paid_months: number;
  payment_type: string;
  is_impulsive?: boolean | null;
}

export const useDebts = (selectedMonth?: string) => {
  const queryClient = useQueryClient();

  const { 
    data: debts = [], 
    isLoading: loading, 
    error: queryError,
    refetch: fetchDebts
  } = useQuery<Debt[]>({
    queryKey: ['debts', selectedMonth],
    queryFn: async () => {
      const response = await api.get('/api/debts/', {
        params: selectedMonth ? { month: selectedMonth } : {}
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (debtData: any) => {
      const response = await api.post('/api/debts/', debtData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/debts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });

  const createDebt = async (debtData: any) => {
    try {
      await createMutation.mutateAsync(debtData);
      return true;
    } catch (err: any) {
      console.error("❌ useDebts: Error creating debt:", err);
      console.error("❌ Detalles del error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      return false;
    }
  };

  const deleteDebt = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch (err) {
      console.error("Error deleting debt:", err);
      return false;
    }
  };

  const error = queryError ? "Error al cargar las deudas" : null;

  return { debts, loading, error, fetchDebts, createDebt, deleteDebt };
};
