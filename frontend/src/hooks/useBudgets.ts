import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Category } from './useCategories';

export interface MonthlyBudget {
  id: number;
  category_id: number;
  month: string;
  budget_amount: number;
  spent_amount: number;
  alert_threshold: number;
  owner_id: number;
  category: Category | null;
  percentage_used: number;
  is_over_budget: boolean;
  should_alert: boolean;
}

export interface CategorySpendingReport {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  total_spent: number;
  budget_amount: number;
  percentage_used: number;
  is_over_budget: boolean;
  transaction_count: number;
}

export const useBudgets = (month?: string) => {
  const queryClient = useQueryClient();

  const { 
    data: budgets = [], 
    isLoading: loading, 
    error: queryError,
    refetch: fetchBudgets
  } = useQuery<MonthlyBudget[]>({
    queryKey: ['budgets', month],
    queryFn: async () => {
      const params = month ? `?month=${month}` : '';
      const response = await api.get(`/api/budgets/${params}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      const response = await api.post('/api/budgets/', budgetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/api/budgets/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/budgets/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const createBudget = async (budgetData: any) => {
    try {
      await createMutation.mutateAsync(budgetData);
      return true;
    } catch (err) {
      console.error("Error creating budget:", err);
      return false;
    }
  };

  const updateBudget = async (id: number, data: any) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return true;
    } catch (err) {
      console.error("Error updating budget:", err);
      return false;
    }
  };

  const deleteBudget = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch (err) {
      console.error("Error deleting budget:", err);
      return false;
    }
  };

  const error = queryError ? "Error al cargar los presupuestos" : null;

  return { budgets, loading, error, fetchBudgets, createBudget, updateBudget, deleteBudget };
};

export const useCategorySpendingReport = (month: string) => {
  const { 
    data: report = [], 
    isLoading: loading, 
    error: queryError,
    refetch: fetchReport
  } = useQuery<CategorySpendingReport[]>({
    queryKey: ['category-spending-report', month],
    queryFn: async () => {
      const response = await api.get(`/api/budgets/reports/category-spending?month=${month}`);
      return response.data;
    },
    enabled: !!month,
  });

  const error = queryError ? "Error al cargar el reporte" : null;

  return { report, loading, error, fetchReport };
};

export const useBudgetAlerts = (month: string) => {
  const { 
    data: alerts = [], 
    isLoading: loading, 
    error: queryError,
    refetch: fetchAlerts
  } = useQuery<MonthlyBudget[]>({
    queryKey: ['budget-alerts', month],
    queryFn: async () => {
      const response = await api.get(`/api/budgets/alerts?month=${month}`);
      return response.data;
    },
    enabled: !!month,
  });

  const error = queryError ? "Error al cargar las alertas" : null;

  return { alerts, loading, error, fetchAlerts };
};

// Made with Bob
