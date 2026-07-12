import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Debt {
  id: number;
  description: string;
  purchase_date: string;
  payment_type: string;
  price: number;
  months?: number;
  has_interest?: boolean;
  interest_rate?: number;
  total_amount: number;
  remaining_amount: number;
  monthly_payment: number;
  category_id?: number;
  category?: Category;
}

interface ExpenseChartProps {
  debts: Debt[];
  filterFrom: string;
  filterTo: string;
}

// Colores por defecto si no hay categoría
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
];

export default function ExpenseChart({ debts, filterFrom, filterTo }: ExpenseChartProps) {
  // Filtrar deudas según el rango de fechas
  const filteredDebts = useMemo(() => {
    if (!filterFrom && !filterTo) return debts;
    
    return debts.filter(debt => {
      const debtDate = debt.purchase_date;
      if (!debtDate) return false;
      
      const from = filterFrom || '0000-00-00';
      const to = filterTo || '9999-99-99';
      
      return debtDate >= from && debtDate <= to;
    });
  }, [debts, filterFrom, filterTo]);

  // Calcular datos para la gráfica agrupados por categoría
  const chartData = useMemo(() => {
    if (filteredDebts.length === 0) return [];

    // Agrupar compras por categoría y sumar totales
    const groupedData = filteredDebts.reduce((acc, debt) => {
      const categoryName = debt.category?.name || 'Sin categoría';
      const categoryIcon = debt.category?.icon || '💰';
      const categoryColor = debt.category?.color || DEFAULT_COLORS[0];
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          value: 0,
          icon: categoryIcon,
          color: categoryColor,
        };
      }
      
      // Para "contado" usamos remaining_amount, para "meses" usamos monthly_payment
      const value = debt.payment_type === 'contado' ? debt.remaining_amount : debt.monthly_payment;
      acc[categoryName].value += value;
      return acc;
    }, {} as Record<string, { value: number; icon: string; color: string }>);

    // Convertir a array y ordenar por valor descendente
    return Object.entries(groupedData)
      .map(([name, data]) => ({
        name,
        value: parseFloat(data.value.toFixed(2)),
        icon: data.icon,
        color: data.color,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredDebts]);

  const totalAmount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Formatear fecha para mostrar
  const formatDateRange = () => {
    if (!filterFrom && !filterTo) return 'Todas las compras';
    
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    };

    if (filterFrom && filterTo) {
      return `${formatDate(filterFrom)} - ${formatDate(filterTo)}`;
    } else if (filterFrom) {
      return `Desde ${formatDate(filterFrom)}`;
    } else if (filterTo) {
      return `Hasta ${formatDate(filterTo)}`;
    }
    return '';
  };

  // Renderizar tooltip personalizado
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0];
      const value = data.value || 0;
      const percentage = ((value / totalAmount) * 100).toFixed(1);
      const categoryData = chartData.find(c => c.name === data.name);
      
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            {categoryData && <span className="text-2xl">{categoryData.icon}</span>}
            <p className="font-semibold text-foreground">{data.name}</p>
          </div>
          <p className="text-primary font-bold">
            ${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">{percentage}% del total</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Análisis de Compras</h3>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          No hay datos para mostrar en el período seleccionado.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Análisis de Compras</h3>
          </div>
          <p className="text-sm text-muted-foreground">{formatDateRange()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Total del período</p>
          <p className="text-2xl font-bold text-primary">
            ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Gráfica */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda de categorías */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Desglose por categoría</p>
        <div className="space-y-2">
          {chartData.map((item, index) => {
            const percentage = ((item.value / totalAmount) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    ${item.value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Total de compras</p>
            <p className="text-lg font-bold text-foreground">{filteredDebts.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Gasto promedio</p>
            <p className="text-lg font-bold text-foreground">
              ${(totalAmount / filteredDebts.length).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center col-span-2 md:col-span-1">
            <p className="text-xs text-muted-foreground mb-1">Categorías</p>
            <p className="text-lg font-bold text-primary">
              {chartData.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
