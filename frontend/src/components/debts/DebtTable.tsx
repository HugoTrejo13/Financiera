import { useMemo, useRef, useState } from 'react';
import { Filter, CalendarDays, Trash2, Search, Zap } from 'lucide-react';
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
  selectedMonth?: string;
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
  setFilterTo,
  selectedMonth
}: DebtTableProps) {
  const filterFromRef = useRef<HTMLInputElement>(null);
  const filterToRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<'all' | 'contado' | 'meses'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  const filteredDebts = useMemo(() => {
    let result = debts;

    // 1. Filtro estricto por mes seleccionado (Aislamiento total por mes)
    if (selectedMonth) {
      result = result.filter(debt => debt.purchase_date && debt.purchase_date.startsWith(selectedMonth));
    }

    // 2. Filtro por búsqueda de texto
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(debt => debt.description.toLowerCase().includes(q));
    }

    // 3. Filtro por tipo de pago
    if (paymentTypeFilter !== 'all') {
      result = result.filter(debt => debt.payment_type === paymentTypeFilter);
    }

    // 4. Filtro por categoría cliqueada
    if (selectedCategoryFilter) {
      result = result.filter(debt => debt.category?.name === selectedCategoryFilter);
    }

    // 5. Filtro por rango de fecha
    if (filterMode === 'range') {
      const from = filterFrom || '0000-00-00';
      const to = filterTo || '9999-99-99';
      result = result.filter(debt => {
        const d = debt.purchase_date;
        return d && d >= from && d <= to;
      });
    }

    return result;
  }, [debts, selectedMonth, filterMode, filterFrom, filterTo, searchQuery, paymentTypeFilter, selectedCategoryFilter]);

  const totalEffectiveCost = useMemo(
    () => filteredDebts.reduce((sum, d) => sum + getEffectiveCost(d), 0),
    [filteredDebts]
  );

  return (
    <div className="lg:col-span-2 rounded-xl border bg-card text-card-foreground shadow-md p-6">
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
            <span>Tus compras</span>
            {selectedCategoryFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 animate-in fade-in duration-200">
                <span>{selectedCategoryFilter}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter(null)}
                  className="hover:text-foreground p-0.5 cursor-pointer"
                  title="Quitar filtro de categoría"
                >
                  ✕
                </button>
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Visualiza y gestiona tus pasivos/activos del mes seleccionado.
          </p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 text-right">
          <p className="text-xs text-muted-foreground leading-none mb-1 font-semibold uppercase tracking-wider">
            {filteredDebts.length} {filteredDebts.length === 1 ? 'Compra' : 'Compras'} · Total
          </p>
          <p className="text-xl font-black text-primary leading-none">
            ${totalEffectiveCost.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Barra de Filtros & Búsqueda */}
      <div className="mb-5 p-4 rounded-2xl border bg-muted/20 space-y-4">
        {/* Buscador en Tiempo Real */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar compras por descripción..."
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros de Tipo de Pago & Fecha */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentTypeFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  paymentTypeFilter === 'all'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm font-bold'
                    : 'bg-background border-input hover:bg-muted text-muted-foreground'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setPaymentTypeFilter('contado')}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  paymentTypeFilter === 'contado'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm font-bold'
                    : 'bg-background border-input hover:bg-muted text-muted-foreground'
                }`}
              >
                Contado
              </button>
              <button
                type="button"
                onClick={() => setPaymentTypeFilter('meses')}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  paymentTypeFilter === 'meses'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm font-bold'
                    : 'bg-background border-input hover:bg-muted text-muted-foreground'
                }`}
              >
                A Meses
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex items-center gap-1.5">
              {(['none', 'range'] as const).map(mode => (
                <button key={mode} type="button" onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${filterMode === mode ? 'bg-primary text-primary-foreground border-primary font-bold' : 'bg-background border-input hover:bg-muted text-muted-foreground'}`}>
                  {mode === 'none' ? 'Cualquier Fecha' : 'Rango Fecha'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filterMode === 'range' && (
          <div className="pt-2 border-t border-border/40 flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
                  className="h-9 rounded-xl border border-input bg-background pl-8 pr-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
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
                  className="h-9 rounded-xl border border-input bg-background pl-8 pr-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Cargando deudas...</div>
      ) : debts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-xl bg-muted/20">
          No tienes deudas registradas. ¡Excelente trabajo financiero!
        </div>
      ) : filteredDebts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-xl bg-muted/20">
          No hay compras que coincidan con la búsqueda o filtro.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-border">
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
                  <td className="px-4 py-3.5 align-middle text-center">
                    {debt.category ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const catName = debt.category?.name || null;
                          setSelectedCategoryFilter(
                            selectedCategoryFilter === catName ? null : catName
                          );
                        }}
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer hover:scale-110 ${
                          selectedCategoryFilter === debt.category.name
                            ? 'ring-2 ring-primary bg-primary/20 scale-110'
                            : ''
                        }`}
                        style={{ backgroundColor: `${debt.category.color}20` }}
                        title={`Filtrar por categoría: ${debt.category.name}`}
                      >
                        <span className="text-xl">{debt.category.icon}</span>
                      </button>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle font-medium text-left">
                    <span className="block break-words font-semibold text-foreground">{debt.description}</span>
                    {debt.is_impulsive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mt-1">
                        <Zap className="w-3 h-3 fill-amber-500" /> Impulsiva
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle text-center text-muted-foreground text-xs whitespace-nowrap">
                    {fmtDate(debt.purchase_date)}
                  </td>
                  <td className="px-4 py-3.5 align-middle text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary whitespace-nowrap border border-primary/20">
                      {debt.payment_type === 'contado' ? 'Contado' : `${debt.months}m ${debt.has_interest ? 'C/I' : 'S/I'}`}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-middle text-center text-muted-foreground whitespace-nowrap tabular-nums">
                    ${debt.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3.5 align-middle text-center font-bold text-primary whitespace-nowrap tabular-nums">
                    ${getEffectiveCost(debt).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3.5 align-middle text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(debt);
                      }}
                      className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors hover:bg-destructive/10 text-destructive h-9 w-9 cursor-pointer"
                      title="Eliminar compra"
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
