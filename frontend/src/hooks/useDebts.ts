import { useState, useEffect } from 'react';
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
}

export const useDebts = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/debts/');
      setDebts(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching debts:", err);
      setError("Error al cargar las deudas");
    } finally {
      setLoading(false);
    }
  };

  const createDebt = async (debtData: any) => {
    try {
      await api.post('/api/debts/', debtData);
      await fetchDebts();
      return true;
    } catch (err) {
      console.error("Error creating debt:", err);
      return false;
    }
  };

  const deleteDebt = async (id: number) => {
    try {
      await api.delete(`/api/debts/${id}`);
      await fetchDebts();
      return true;
    } catch (err) {
      console.error("Error deleting debt:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  return { debts, loading, error, fetchDebts, createDebt, deleteDebt };
};
