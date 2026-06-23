import { useMemo, useRef } from 'react';
import { Filter, CalendarDays, Trash2 } from 'lucide-react';
import type { Debt } from '../../hooks/useDebts';

interface DebtTableProps {
  debts: Debt[];
  loading: boolean;
  onDelete: (debt: Debt) => void;
  onSelectDebt: (debt: Debt) => void;
  filterMode: 'none' | 'range';
  setFilterMode: (mode: 'none' | 'range') => void;
  filterFrom: string;
  setFilterFrom: (val: string) => void;
  filterTo: string;
  setFilterTo: (val: string) => void;
}

const getEffectiveCost = (debt: Debt): number => {
  if (debt.payment_type === 'meses') return debt.monthly_payment;
  return debt.remaining_amount;
};

const fmtDate = (d: string) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

export default function DebtTable({
  debts,
  loading,
  onDelete,
  onSelectDebt,
  filterMode,
  setFilterMode,
  filterFrom,
  setFilterFrom,
  filterTo,
  setFilterTo
}: DebtTableProps) {
  const filterFromRef = useRef<HTMLInputElement>(null);
  const filterToRef = useRef<HTMLInputElement>(null);

  const filteredDebts = useMemo(() => {
    if (filterMode === 'none') return debts;
    return debts.filter(debt => {
      const d = debt.purchase_date;
      if (!d) return false;
      if (filterMode === 'range') {
        const from = filterFrom || '0000-00-00';
        const to = filterTo || '9999-99-99';
        return d >= from && d <= to;
      }
      return true;
    });
  }, [debts, filterMode, filterFrom, filterTo]);

  const totalEffectiveCost = useMemo(
    () => filteredDebts.reduce((sum, d) => sum + getEffectiveCost(d), 0),
    [filteredDebts]
  );

  return (
    <div className="lg:col-span-2 rounded-xl border bg-card text-card-foreground shadow-md p-6">
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold leading-none tracking-tight">Tus gastos</h3>
          <p className="text-sm text-muted-foreground mt-1">Visualiza y gestiona tus pasivos/activos actuales.</p>
        </div>
        {filterMode === 'range' && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-right">
            <p className="text-xs text-muted-foreground leading-none mb-1">Total a pagar</p>
            <p className="text-lg font-bold text-primary leading-none">
              ${(filterFrom || filterTo ? totalEffectiveCost : 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      <div className="mb-4 p-3 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filtrar por fecha</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['none', 'range'] as const).map(mode => (
            <button key={mode} type="button" onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${filterMode === mode ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-input hover:bg-muted'}`}>
              {mode === 'none' ? 'Todas' : 'Mes personalizado'}
            </button>
          ))}
        </div>

        {filterMode === 'range' && (
          <div className="mt-3 flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Desde</label>
              <div className="relative">
                <CalendarDays
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => filterFromRef.current?.showPicker()}
                />
                <input
                  ref={filterFromRef}
                  type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background pl-7 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Hasta</label>
              <div className="relative">
                <CalendarDays
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => filterToRef.current?.showPicker()}
                />
                <input
                  ref={filterToRef}
                  type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background pl-7 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Cargando deudas...</div>
      ) : debts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg bg-muted/20">
          No tienes deudas registradas. ¡Excelente trabajo financiero!
        </div>
      ) : filteredDebts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg bg-muted/20">
          No hay compras en el período seleccionado.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">Categoría</th>
                <th className="h-11 px-4 text-left align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">Descripción</th>
                <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">Fecha</th>
                <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">Tipo de Pago</th>
                <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">Precio Total</th>
                <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">Monto Mensual</th>
                <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">Acción</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredDebts.map((debt) => (
                <tr
                  key={debt.id}
                  onClick={() => onSelectDebt(debt)}
                  className="border-b transition-colors hover:bg-muted/60 cursor-pointer"
                >
                  <td className="px-4 py-3 align-middle text-center">
                    {debt.category ? (
                      <div
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{ backgroundColor: `${debt.category.color}20` }}
                        title={debt.category.name}
                      >
                        <span className="text-xl">{debt.category.icon}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle font-medium text-left">
                    <span className="block break-words max-w-[200px]">{debt.description}</span>
                  </td>
                  <td className="px-4 py-3 align-middle text-center text-muted-foreground text-xs whitespace-nowrap">
                    {fmtDate(debt.purchase_date)}
                  </td>
                  <td className="px-4 py-3 align-middle text-center">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary whitespace-nowrap">
                      {debt.payment_type === 'contado' ? 'Contado' : `${debt.months}m ${debt.has_interest ? 'C/I' : 'S/I'}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-center text-muted-foreground whitespace-nowrap tabular-nums">
                    ${debt.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 align-middle text-center font-semibold text-primary whitespace-nowrap tabular-nums">
                    ${getEffectiveCost(debt).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 align-middle text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(debt);
                      }}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 text-destructive h-9 w-9 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
