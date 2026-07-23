import { useState, useEffect } from 'react';
import { X, Trophy, Zap, ShoppingBag, PieChart, Sparkles } from 'lucide-react';
import api from '../../lib/api';

interface MonthlyRecapModalProps {
  month: string;
  onClose: () => void;
}

interface RecapData {
  month: string;
  total_spent: number;
  total_count: number;
  impulsive_count: number;
  impulsive_percentage: number;
  highest_purchase: {
    description: string;
    price: number;
  } | null;
  top_category: {
    name: string;
    icon: string;
    total: number;
    percentage: number;
  } | null;
}

export default function MonthlyRecapModal({ month, onClose }: MonthlyRecapModalProps) {
  const [recap, setRecap] = useState<RecapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/debts/monthly-recap?month=${month}`)
      .then(res => setRecap(res.data))
      .catch(err => console.error("Error fetching recap", err))
      .finally(() => setLoading(false));
  }, [month]);

  const formatMonthName = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, m] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(m) - 1, 1);
    const monthName = date.toLocaleString('es-ES', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-3xl p-6 md:p-8 animate-in zoom-in-95 fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Recapitulación del Mes</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                {formatMonthName(month)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm font-medium">Generando cierre de mes...</p>
          </div>
        ) : !recap || recap.total_count === 0 ? (
          <div className="text-center py-10 space-y-3">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="text-base font-semibold">Sin actividad en este mes</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              No se registraron compras ni pasivos durante {formatMonthName(month)}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Total acumulado */}
            <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Gasto Total del Mes</p>
              <p className="text-4xl font-black text-primary tracking-tight">
                ${recap.total_spent.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-semibold">
                {recap.total_count} {recap.total_count === 1 ? 'compra registrada' : 'compras registradas'}
              </p>
            </div>

            {/* Grid de Destacados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Categoría Top */}
              <div className="bg-muted/30 border border-border/50 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Categoría</span>
                </div>
                {recap.top_category ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{recap.top_category.icon}</span>
                      <span className="font-bold text-base">{recap.top_category.name}</span>
                    </div>
                    <p className="text-xs text-primary font-bold mt-1">
                      ${recap.top_category.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ({recap.top_category.percentage}%)
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">—</p>
                )}
              </div>

              {/* Compra más alta */}
              <div className="bg-muted/30 border border-border/50 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mayor Compra</span>
                </div>
                {recap.highest_purchase ? (
                  <div>
                    <p className="font-bold text-sm truncate">{recap.highest_purchase.description}</p>
                    <p className="text-xs text-amber-600 font-bold mt-1">
                      ${recap.highest_purchase.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">—</p>
                )}
              </div>
            </div>

            {/* Impulsividad */}
            <div className="bg-muted/30 border border-border/50 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Compras Impulsivas</p>
                  <p className="text-xs text-muted-foreground">
                    {recap.impulsive_count} de {recap.total_count} compras no planificadas
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {recap.impulsive_percentage}%
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-foreground text-background font-bold text-sm rounded-2xl hover:bg-foreground/90 transition-colors shadow-md cursor-pointer"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
