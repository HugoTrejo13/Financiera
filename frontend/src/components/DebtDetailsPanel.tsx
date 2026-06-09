import React, { useMemo } from 'react';
import { X, Calendar, DollarSign, TrendingDown, CheckCircle2, Clock, Info } from 'lucide-react';

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
}

interface DebtDetailsPanelProps {
  debt: Debt;
  onClose: () => void;
}

export default function DebtDetailsPanel({ debt, onClose }: DebtDetailsPanelProps) {
  
  // Lógica de fechas y meses transcurridos
  const { monthsElapsed, totalMonths, isCompleted, amortization } = useMemo(() => {
    const start = new Date(debt.purchase_date);
    const today = new Date();
    
    // Calcular meses de diferencia (aproximado por calendario)
    let elapsed = (today.getFullYear() - start.getFullYear()) * 12;
    elapsed += today.getMonth() - start.getMonth();
    if (today.getDate() < start.getDate()) {
      elapsed--; // Aún no cumple el mes en el día exacto
    }
    
    elapsed = Math.max(0, elapsed); // No puede ser negativo
    const total = debt.payment_type === 'meses' && debt.months ? debt.months : 1;
    
    const cappedElapsed = Math.min(elapsed, total);
    
    // Generar línea de tiempo de pagos
    const schedule = [];
    for (let i = 1; i <= total; i++) {
      const paymentDate = new Date(start);
      paymentDate.setMonth(start.getMonth() + i);
      schedule.push({
        month: i,
        date: paymentDate,
        status: i <= cappedElapsed ? 'paid' : 'pending'
      });
    }

    return {
      monthsElapsed: cappedElapsed,
      totalMonths: total,
      isCompleted: cappedElapsed >= total,
      amortization: schedule
    };
  }, [debt]);

  // Cálculos financieros
  const { principal, interest, totalPaid, remaining } = useMemo(() => {
    const isMeses = debt.payment_type === 'meses';
    const total = isMeses ? debt.total_amount : debt.price;
    const prin = debt.price;
    const int = isMeses && debt.has_interest ? total - prin : 0;
    
    const paid = isMeses ? debt.monthly_payment * monthsElapsed : (monthsElapsed > 0 ? total : 0);
    const rem = total - paid;

    return { principal: prin, interest: int, totalPaid: paid, remaining: rem };
  }, [debt, monthsElapsed]);

  const progressPercentage = Math.min(100, Math.max(0, (monthsElapsed / totalMonths) * 100));

  const fmtCurrency = (val: number) => 
    val.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  const fmtDate = (d: string | Date) => {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    return dateObj.toLocaleDateString('es-MX', { month: 'short', year: 'numeric', day: 'numeric' });
  };

  return (
    <>
      {/* Overlay oscuro para enfocar el panel */}
      <div 
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Panel Deslizable */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Encabezado */}
        <header className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div>
            <h2 className="text-xl font-bold tracking-tight line-clamp-1">{debt.description}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="w-3.5 h-3.5" /> Comprado el {fmtDate(debt.purchase_date)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Tarjeta de Resumen */}
          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Desglose Financiero
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Valor original (Capital)</span>
                <span className="font-medium text-foreground">{fmtCurrency(principal)}</span>
              </div>
              
              {debt.payment_type === 'meses' && debt.has_interest && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Intereses ({debt.interest_rate}%) <Info className="w-3 h-3" />
                  </span>
                  <span className="font-medium text-destructive">+{fmtCurrency(interest)}</span>
                </div>
              )}
              
              <div className="h-px w-full bg-primary/20 my-2" />
              
              <div className="flex justify-between items-end">
                <span className="font-semibold text-foreground">Costo Total Final</span>
                <span className="text-2xl font-bold text-primary tabular-nums">
                  {fmtCurrency(principal + interest)}
                </span>
              </div>
            </div>
          </section>

          {/* Progreso */}
          {debt.payment_type === 'meses' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Progreso de Pago</h3>
                <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-muted text-foreground">
                  {monthsElapsed} de {totalMonths} meses
                </span>
              </div>
              
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Pagado</span>
                  <span className="font-semibold text-foreground">{fmtCurrency(totalPaid)}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-muted-foreground">Restante</span>
                  <span className="font-semibold text-foreground">{fmtCurrency(remaining)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Línea de tiempo de Amortización */}
          {debt.payment_type === 'meses' && amortization.length > 0 && (
            <section>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-muted-foreground" />
                Calendario de Pagos
              </h3>
              
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {amortization.map((payment, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${payment.status === 'paid' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {payment.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm transition-colors hover:bg-muted/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-sm ${payment.status === 'paid' ? 'text-green-500' : 'text-foreground'}`}>
                          Pago {payment.month}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {fmtDate(payment.date)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {fmtCurrency(debt.monthly_payment)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
        
        {/* Footer del panel */}
        <div className="p-6 border-t border-border bg-muted/10">
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold transition-colors cursor-pointer"
          >
            Cerrar Detalles
          </button>
        </div>
      </div>
    </>
  );
}
