import { useState, useEffect } from 'react';
import { Wallet, Trash2 } from 'lucide-react';
import DebtDetailsModal from './DebtDetailsModal';
import ExpenseChart from './ExpenseChart';
import DebtForm from './debts/DebtForm';
import DebtTable from './debts/DebtTable';
import { useDebts } from '../hooks/useDebts';
import type { Debt } from '../hooks/useDebts';
import { useCategories } from '../hooks/useCategories';

export default function DebtsView() {
  const { debts, loading, fetchDebts, createDebt, deleteDebt } = useDebts();
  const { categories } = useCategories();
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null);

  // Filter states
  const [filterMode, setFilterMode] = useState<'none' | 'range'>('none');
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=MXN');
      const data = await res.json();
      if (data && data.rates && data.rates.MXN) {
        setCurrentExchangeRate(data.rates.MXN);
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteDebt(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-background text-foreground relative">
      {/* Modal Confirm Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-destructive/10 p-4 rounded-full">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">¿Eliminar compra?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Estás a punto de eliminar <span className="font-semibold text-foreground">"{deleteTarget.description}"</span>. Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <button onClick={() => setDeleteTarget(null)}
                  className="py-2.5 px-4 rounded-lg border border-input bg-transparent text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
                  No, cancelar
                </button>
                <button onClick={confirmDelete}
                  className="py-2.5 px-4 rounded-lg bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 transition-colors shadow-sm cursor-pointer">
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="mb-8 pr-16">
        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
          <Wallet className="text-primary w-8 h-8" />
          GESTIÓN DE GASTOS
        </h1>
        <p className="text-muted-foreground mt-2">Administra tus pasivos/activos y simula tus planes de pago de manera eficiente.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="space-y-8">
          <DebtForm
            categories={categories}
            onCreate={createDebt}
            currentExchangeRate={currentExchangeRate}
          />

          {debts.length > 0 && (
            <div data-tour="expense-chart">
              <ExpenseChart
                debts={debts as any}
                filterFrom={filterFrom}
                filterTo={filterTo}
              />
            </div>
          )}
        </div>

        <DebtTable
          debts={debts}
          loading={loading}
          onDelete={setDeleteTarget}
          onSelectDebt={setSelectedDebt}
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          filterFrom={filterFrom}
          setFilterFrom={setFilterFrom}
          filterTo={filterTo}
          setFilterTo={setFilterTo}
        />
      </div>

      {selectedDebt && (
        <DebtDetailsModal 
          debt={selectedDebt as any} 
          onClose={() => setSelectedDebt(null)} 
          onUpdated={async () => {
            await fetchDebts();
            setSelectedDebt(null);
          }}
        />
      )}
    </div>
  );
}
