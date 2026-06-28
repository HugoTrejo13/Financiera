import { useState, useEffect } from 'react';
import { PiggyBank, Plus, Trash2, Edit2, AlertTriangle, TrendingUp } from 'lucide-react';
import { useBudgets, useCategorySpendingReport, useBudgetAlerts } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';

export default function BudgetManager() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { categories } = useCategories();
  const { budgets, createBudget, updateBudget, deleteBudget } = useBudgets(currentMonth);
  const { report } = useCategorySpendingReport(currentMonth);
  const { alerts } = useBudgetAlerts(currentMonth);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    budget_amount: '',
    alert_threshold: '0.8'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const budgetData = {
      category_id: parseInt(formData.category_id),
      month: currentMonth,
      budget_amount: parseFloat(formData.budget_amount),
      alert_threshold: parseFloat(formData.alert_threshold)
    };

    if (editingBudget) {
      await updateBudget(editingBudget.id, {
        budget_amount: budgetData.budget_amount,
        alert_threshold: budgetData.alert_threshold
      });
      setEditingBudget(null);
    } else {
      await createBudget(budgetData);
    }

    setFormData({ category_id: '', budget_amount: '', alert_threshold: '0.8' });
    setShowAddForm(false);
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setFormData({
      category_id: budget.category_id.toString(),
      budget_amount: budget.budget_amount.toString(),
      alert_threshold: budget.alert_threshold.toString()
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este presupuesto?')) {
      await deleteBudget(id);
    }
  };

  const availableCategories = categories.filter(cat => 
    !budgets.some(b => b.category_id === cat.id) || editingBudget?.category_id === cat.id
  );

  return (
    <div className="p-6 md:p-10 min-h-screen bg-background text-foreground">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
          <PiggyBank className="text-primary w-8 h-8" />
          PRESUPUESTO MENSUAL
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tus presupuestos por categoría y monitorea tus gastos
        </p>
      </header>

      {/* Selector de mes */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Mes</label>
        <input
          type="month"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="px-4 py-2 rounded-lg border border-input bg-background"
        />
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-destructive">Alertas de Presupuesto</h3>
          </div>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span>{alert.category?.icon}</span>
                  <span>{alert.category?.name}</span>
                </span>
                <span className="font-semibold text-destructive">
                  {alert.percentage_used.toFixed(1)}% usado
                  {alert.is_over_budget && ' (Excedido)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario de presupuesto */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </h2>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              )}
            </div>

            {showAddForm && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                    disabled={!!editingBudget}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                  >
                    <option value="">Seleccionar categoría</option>
                    {availableCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Presupuesto ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budget_amount}
                    onChange={(e) => setFormData({ ...formData, budget_amount: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Umbral de alerta (% del presupuesto)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.alert_threshold}
                    onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    placeholder="0.8 (80%)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recibirás una alerta cuando alcances este porcentaje (ej: 0.8 = 80%)
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    {editingBudget ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingBudget(null);
                      setFormData({ category_id: '', budget_amount: '', alert_threshold: '0.8' });
                    }}
                    className="px-6 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Lista de presupuestos */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Presupuestos Activos</h2>
            {budgets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay presupuestos para este mes
              </p>
            ) : (
              <div className="space-y-3">
                {budgets.map(budget => (
                  <div
                    key={budget.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{budget.category?.icon}</span>
                        <span className="font-semibold">{budget.category?.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gastado:</span>
                        <span className={`font-medium ${budget.is_over_budget ? 'text-destructive' : ''}`}>
                          ${budget.spent_amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Presupuesto:</span>
                        <span className="font-medium">${budget.budget_amount.toFixed(2)}</span>
                      </div>
                      {(budget.is_over_budget || budget.should_alert) && (
                        <div className="flex items-center gap-2 text-sm mt-2 px-2 py-1 rounded bg-destructive/10">
                          <span className={`font-semibold ${
                            budget.is_over_budget ? 'text-destructive' : 'text-yellow-600'
                          }`}>
                            {budget.is_over_budget
                              ? '⚠️ Presupuesto excedido'
                              : '⚠️ Cerca del límite'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reporte de gastos por categoría */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Reporte de Gastos</h2>
          </div>

          {report.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay datos para este mes
            </p>
          ) : (
            <div className="space-y-4">
              {report.map(item => (
                <div
                  key={item.category_id}
                  className="border border-border rounded-lg p-4"
                  style={{ borderLeftWidth: '4px', borderLeftColor: item.category_color }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.category_icon}</span>
                      <div>
                        <h3 className="font-semibold">{item.category_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.transaction_count} transacción{item.transaction_count !== 1 ? 'es' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${item.total_spent.toFixed(2)}</p>
                      {item.budget_amount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          de ${item.budget_amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.budget_amount > 0 && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{item.percentage_used.toFixed(1)}% del presupuesto</span>
                        {item.is_over_budget && (
                          <span className="text-destructive font-semibold">¡Excedido!</span>
                        )}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            item.is_over_budget ? 'bg-destructive' : 'bg-primary'
                          }`}
                          style={{ 
                            width: `${Math.min(item.percentage_used, 100)}%`,
                            backgroundColor: item.category_color
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
