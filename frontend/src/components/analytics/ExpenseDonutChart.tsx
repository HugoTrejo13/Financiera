import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CategorySpendingReport } from '../../hooks/useCategories';

interface Props {
  data: CategorySpendingReport[];
}

export default function ExpenseDonutChart({ data }: Props) {
  const chartData = data
    .filter(item => item.total_spent > 0)
    .map(item => ({
      name: item.category_name,
      value: item.total_spent,
      color: item.category_color || '#8884d8'
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm bg-muted/20 rounded-2xl">
        No hay compras registradas este mes
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Compra']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
