import { useState, useEffect } from 'react';
import api from '../lib/api';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error("Error al cargar categorías", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return { categories, loading };
};
