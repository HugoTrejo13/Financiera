import { useCategorySpendingReport } from '../hooks/useBudgets';
import { useDebts } from '../hooks/useDebts';
import ExpenseDonutChart from '../components/analytics/ExpenseDonutChart';
import BudgetProgressBar from '../components/analytics/BudgetProgressBar';
import { Wallet, TrendingDown, Target } from 'lucide-react';

export default function Dashboard() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { report, loading: reportLoading } = useCategorySpendingReport(currentMonth);
  const { debts, loading: debtsLoading } = useDebts();

  if (reportLoading || debtsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalSpent = report.reduce((acc, item) => acc + item.total_spent, 0);
  const totalBudget = report.reduce((acc, item) => acc + item.budget_amount, 0);
  const activeDebtsTotal = debts.reduce((acc, debt) => acc + debt.remaining_amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tu Resumen Financiero</h1>
        <p className="text-muted-foreground mt-1">Un vistazo claro a tu dinero este mes.</p>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Gastado este mes</h3>
          </div>
          <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Presupuesto Global</h3>
          </div>
          <p className="text-3xl font-bold">${totalBudget.toFixed(2)}</p>
          <div className="w-full bg-muted rounded-full h-1.5 mt-4">
            <div 
              className={`h-1.5 rounded-full ${totalSpent > totalBudget ? 'bg-destructive' : 'bg-green-500'}`}
              style={{ width: `${Math.min((totalSpent / (totalBudget || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <TrendingDown className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Deuda Activa (Abonos)</h3>
          </div>
          <p className="text-3xl font-bold">${activeDebtsTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Distribución de Gastos</h3>
          <ExpenseDonutChart data={report} />
        </div>
        
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Presupuesto vs Realidad</h3>
          <BudgetProgressBar data={report} />
        </div>
      </div>
    </div>
  );
}
