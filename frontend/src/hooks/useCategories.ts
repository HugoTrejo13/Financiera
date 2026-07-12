import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export const useCategories = () => {
  const { data: categories = [], isLoading: loading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/api/categories/');
      return response.data;
    },
  });

  return { categories, loading };
};

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

export const useCategorySpendingReport = (month: string) => {
  const { data: report = [], isLoading: loading } = useQuery<CategorySpendingReport[]>({
    queryKey: ['category-spending', month],
    queryFn: async () => {
      const response = await api.get(`/api/categories/reports/category-spending?month=${month}`);
      return response.data;
    },
    enabled: !!month,
  });

  return { report, loading };
};
