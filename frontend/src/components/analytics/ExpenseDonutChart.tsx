import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CategorySpendingReport } from '../../hooks/useCategories';
import { TrendingUp, Receipt } from 'lucide-react';

interface Props {
  data: CategorySpendingReport[];
}

export default function ExpenseDonutChart({ data }: Props) {
  const chartData = useMemo(() => {
    return data
      .filter(item => item.total_spent > 0)
      .map(item => ({
        name: item.category_name,
        value: item.total_spent,
        color: item.category_color || '#8884d8',
        icon: item.category_icon || '💰'
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const totalAmount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);



  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm bg-muted/20 rounded-2xl">
        <Receipt className="w-8 h-8 mb-2 opacity-50" />
        No hay compras registradas este mes
      </div>
    );
  }

  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      const percentage = ((pData.value / totalAmount) * 100).toFixed(1);
      
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{pData.icon}</span>
            <p className="font-semibold text-foreground">{pData.name}</p>
          </div>
          <p className="text-primary font-bold">
            ${pData.value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">{percentage}% del total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Resumen Superior */}
      <div className="w-full">
        <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total del mes</p>
          </div>
          <p className="text-2xl font-bold">${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>

        {/* Gráfica */}
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                label={({ percent }: any) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Columna Derecha: Desglose */}
      <div className="w-full space-y-3 bg-card rounded-2xl">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/50 pb-2">
          Desglose por categoría
        </h4>
        <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {chartData.map((item, i) => {
            const itemPercentage = totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : '0.0';
            return (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium text-sm group-hover:text-primary transition-colors">
                    {item.name}
                  </span>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    {itemPercentage}%
                  </span>
                  <p className="font-bold text-sm">
                    ${item.value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
