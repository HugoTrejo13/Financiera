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
