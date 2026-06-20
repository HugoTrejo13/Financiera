import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Wallet, CalendarDays, Filter } from 'lucide-react';
import api from '../lib/api';
import DebtDetailsModal from './DebtDetailsModal';
import ExpenseChart from './ExpenseChart';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Debt {
  id: number;
  description: string;
  purchase_date: string; // YYYY-MM-DD
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

interface DebtsViewProps {
  onBack?: () => void;
}

// Helper: get the "effective monthly cost" shown in Monto Restante column
const getEffectiveCost = (debt: Debt): number => {
  if (debt.payment_type === 'meses') return debt.monthly_payment;
  return debt.remaining_amount;
};

export default function DebtsView({ onBack }: DebtsViewProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  // Form states
  const [paymentType, setPaymentType] = useState<'contado' | 'meses' | ''>('');
  const [hasInterest, setHasInterest] = useState<'si' | 'no' | ''>('');
  const [priceStr, setPriceStr] = useState<string>('');
  const [currency, setCurrency] = useState<'mxn' | 'usd'>('mxn');
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number | null>(null);
  const [isImpulsive, setIsImpulsive] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Filter states
  const [filterMode, setFilterMode] = useState<'none' | 'range'>('none');
  const [filterFrom, setFilterFrom] = useState<string>('');   // YYYY-MM-DD
  const [filterTo, setFilterTo] = useState<string>('');       // YYYY-MM-DD

  // Refs para los inputs de fecha del filtro
  const filterFromRef = useRef<HTMLInputElement>(null);
  const filterToRef = useRef<HTMLInputElement>(null);

  // Ref para el input de fecha
  const dateInputRef = useRef<HTMLInputElement>(null);

  const formatWithCommas = (raw: string): string => {
    let val = raw.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    if (val !== '') {
      const splitVal = val.split('.');
      splitVal[0] = splitVal[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      val = splitVal.join('.');
    }
    return val;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPriceStr(formatWithCommas(e.target.value));

  const t = {
    headerTitle: "GESTIÓN DE GASTOS",
    headerSubtitle: "Administra tus pasivos/activos y simula tus planes de pago de manera eficiente.",
    newDebtTitle: "Nueva compra",
    newDebtSubtitle: "Agrega un nuevo gasto a tu portafolio.",
    descLabel: "Descripción de la compra",
    descPlaceholder: "Ej. Iphone 17...",
    dateLabel: "Fecha de la compra",
    paymentTypeLabel: "Tipo de Pago",
    typeContado: "Pago de contado",
    typeMeses: "Pago a meses",
    currencyLabel: "Moneda",
    currencyMXN: "Peso Mexicano",
    currencyUSD: "Dólar (USD)",
    exchangeRateLabel: "Precio del dólar hoy (MXN)",
    exchangeRatePlaceholder: "Ej. 17.50",
    priceLabel: "Precio del producto",
    monthsLabel: "¿A cuántos meses?",
    interestTypeLabel: "¿Con o sin intereses?",
    typeSinIntereses: "Meses sin intereses",
    typeConIntereses: "Con intereses",
    interestLabel: "Tasa de Interés (%)",
    addButton: "Añadir Compra",
    activeDebtsTitle: "Tus gastos",
    activeDebtsSubtitle: "Visualiza y gestiona tus pasivos/activos actuales.",
    loading: "Cargando deudas...",
    empty: "No tienes deudas registradas. ¡Excelente trabajo financiero!",
    emptyFiltered: "No hay compras en el período seleccionado.",
    colDesc: "Descripción",
    colDate: "Fecha",
    colType: "Tipo de Pago",
    colPrice: "Precio Total",
    colRemaining: "Monto Mensual",
    colAction: "Acción",
    errorCreate: "Error al crear deuda",
    filterLabel: "Filtrar por fecha",
    filterNone: "Todas",
    filterRange: "Mes personalizado",
    filterFromLabel: "Desde",
    filterToLabel: "Hasta",
  };

  const fetchDebts = async () => {
    try {
      const res = await api.get('/api/debts/');
      setDebts(res.data);
    } catch (err) {
      console.error('Error fetching debts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

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
    fetchDebts();
    fetchExchangeRate();
    fetchCategories();
  }, []);

  // Filtered debts
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

  // Total cost (Monto Restante for contado, monthly_payment for meses)
  const totalEffectiveCost = useMemo(
    () => filteredDebts.reduce((sum, d) => sum + getEffectiveCost(d), 0),
    [filteredDebts]
  );

  const handleAddDebt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const form = new FormData(formElement);

    try {
      await api.post('/api/debts/', {
        description: form.get('description'),
        purchase_date: form.get('purchase_date'),
        payment_type: paymentType,
        price: (() => {
          const rawPrice = parseFloat(priceStr.replace(/,/g, ''));
          if (currency === 'usd') {
            const rate = currentExchangeRate || 1;
            return rawPrice * rate;
          }
          return rawPrice;
        })(),
        months: paymentType === 'meses' ? parseInt(form.get('months') as string) : null,
        has_interest: paymentType === 'meses' ? (hasInterest === 'si') : null,
        interest_rate: (paymentType === 'meses' && hasInterest === 'si')
          ? parseFloat(form.get('interestRate') as string) : 0,
        category_id: selectedCategory,
      });

      formElement.reset();
      setPaymentType('');
      setHasInterest('');
      setPriceStr('');
      setCurrency('mxn');
      setIsImpulsive(null);
      setSelectedCategory(null);
      fetchDebts();
    } catch (err) {
      console.error('Error creating debt', err);
      alert(t.errorCreate);
    }
  };

  const handleDelete = (debt: Debt) => setDeleteTarget(debt);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/debts/${deleteTarget.id}`);
      fetchDebts();
    } catch (err) {
      console.error('Error deleting debt', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
  const labelClass = "text-sm font-medium leading-none block mb-2 mt-4 text-foreground";

  // Format date for display
  const fmtDate = (d: string) => {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-background text-foreground relative">

      {/* Modal de confirmación */}
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

      {/* Botón Regresar */}
      <button onClick={onBack}
        className="absolute top-6 right-6 p-3 rounded-full bg-card border border-border shadow-sm transition-transform hover:scale-110 hover:bg-muted group"
        title="Volver al Lobby">
        <Wallet className="w-6 h-6 text-primary group-hover:text-primary/80" />
      </button>

      <header className="mb-8 pr-16">
        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
          <Wallet className="text-primary w-8 h-8" />
          {t.headerTitle}
        </h1>
        <p className="text-muted-foreground mt-2">{t.headerSubtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── COLUMNA IZQUIERDA: FORMULARIO Y GRÁFICA ── */}
        <div className="space-y-8">
          {/* ── FORMULARIO ── */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6" data-tour="add-expense">
          <div className="flex flex-col space-y-1.5 mb-5">
            <h3 className="font-semibold leading-none tracking-tight">{t.newDebtTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.newDebtSubtitle}</p>
          </div>

          <form onSubmit={handleAddDebt} className="space-y-2">
            {/* Categoría */}
            <div>
              <label className={labelClass}>Categoría</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all hover:scale-105 ${
                      selectedCategory === cat.id
                        ? 'border-2 shadow-md'
                        : 'border-input hover:bg-muted'
                    }`}
                    style={{
                      borderColor: selectedCategory === cat.id ? cat.color : undefined,
                      backgroundColor: selectedCategory === cat.id ? `${cat.color}15` : undefined,
                    }}
                    title={cat.name}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-[10px] font-medium text-center leading-tight">{cat.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="desc" className={labelClass}>{t.descLabel}</label>
              <input id="desc" name="description" type="text" required placeholder={t.descPlaceholder} className={inputClass} />
            </div>

            {/* Fila: Fecha y Compra Impulsiva */}
            <div className="grid grid-cols-2 gap-4">
              {/* Fecha de compra */}
              <div>
                <label htmlFor="purchase_date" className={labelClass}>{t.dateLabel}</label>
                <div className="relative">
                  <CalendarDays
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => dateInputRef.current?.showPicker()}
                  />
                  <input
                    ref={dateInputRef}
                    id="purchase_date" name="purchase_date" type="date" required
                    className={inputClass + " pl-9"}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Compra Impulsiva */}
              <div>
                <label className={labelClass}>¿Compra impulsiva?</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button type="button" onClick={() => setIsImpulsive(true)}
                    className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${isImpulsive === true ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input text-muted-foreground hover:bg-muted'}`}>
                    Sí
                  </button>
                  <button type="button" onClick={() => setIsImpulsive(false)}
                    className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${isImpulsive === false ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input text-muted-foreground hover:bg-muted'}`}>
                    No
                  </button>
                </div>
              </div>
            </div>

            {/* Tipo de pago */}
            <div>
              <label className={labelClass}>{t.paymentTypeLabel}</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button type="button" onClick={() => setPaymentType('contado')}
                  className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${paymentType === 'contado' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                  {t.typeContado}
                </button>
                <button type="button" onClick={() => setPaymentType('meses')}
                  className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${paymentType === 'meses' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                  {t.typeMeses}
                </button>
              </div>
            </div>

            {/* ── CASO: CONTADO ── */}
            {paymentType === 'contado' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                <div>
                  <label htmlFor="price" className={labelClass}>{t.priceLabel}</label>
                  <input id="price" name="price" type="text" required placeholder="0.00"
                    className={inputClass} value={priceStr} onChange={handlePriceChange} />
                </div>
                <div>
                  <label className={labelClass}>{t.currencyLabel}</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button type="button" onClick={() => setCurrency('mxn')}
                      className={`py-2 px-3 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-1.5 ${currency === 'mxn' ? 'bg-green-700/80 text-white border-green-600 shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                      🇲🇽 {t.currencyMXN}
                    </button>
                    <button type="button" onClick={() => setCurrency('usd')}
                      className={`py-2 px-3 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-1.5 ${currency === 'usd' ? 'bg-blue-700/80 text-white border-blue-600 shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                      🇺🇸 {t.currencyUSD}
                    </button>
                  </div>
                </div>
                {currency === 'usd' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm font-medium text-muted-foreground">
                      {currentExchangeRate ? `1 USD = $${currentExchangeRate.toFixed(2)} MXN` : 'Cargando tipo de cambio...'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── CASO: MESES ── */}
            {paymentType === 'meses' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                <div>
                  <label className={labelClass}>{t.interestTypeLabel}</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button type="button" onClick={() => setHasInterest('no')}
                      className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${hasInterest === 'no' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                      {t.typeSinIntereses}
                    </button>
                    <button type="button" onClick={() => setHasInterest('si')}
                      className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${hasInterest === 'si' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                      {t.typeConIntereses}
                    </button>
                  </div>
                </div>

                {hasInterest !== '' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2 mt-4">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <label htmlFor="months" className={labelClass}>{t.monthsLabel}</label>
                        <input id="months" name="months" type="number" required min="1" max="24" step="1"
                          placeholder="Ej. 12 (máx. 24)" className={inputClass}
                          onChange={(e) => {
                            const v = parseInt(e.target.value);
                            if (v > 24) e.target.value = '24';
                            if (v < 1 && e.target.value !== '') e.target.value = '1';
                          }}
                        />
                      </div>
                      {hasInterest === 'si' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <label htmlFor="interestRate" className={labelClass}>{t.interestLabel}</label>
                          <input id="interestRate" name="interestRate" type="number" required min="0" step="0.01" placeholder="Ej. 16.0" className={inputClass} />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="price" className={labelClass}>{t.priceLabel}</label>
                      <input id="price" name="price" type="text" required placeholder="0.00"
                        className={inputClass} value={priceStr} onChange={handlePriceChange} />
                    </div>
                    <div>
                      <label className={labelClass}>{t.currencyLabel}</label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button type="button" onClick={() => setCurrency('mxn')}
                          className={`py-2 px-3 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-1.5 ${currency === 'mxn' ? 'bg-green-700/80 text-white border-green-600 shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                          🇲🇽 {t.currencyMXN}
                        </button>
                        <button type="button" onClick={() => setCurrency('usd')}
                          className={`py-2 px-3 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-1.5 ${currency === 'usd' ? 'bg-blue-700/80 text-white border-blue-600 shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                          🇺🇸 {t.currencyUSD}
                        </button>
                      </div>
                    </div>
                    {currency === 'usd' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-sm font-medium text-muted-foreground">
                          {currentExchangeRate ? `1 USD = $${currentExchangeRate.toFixed(2)} MXN` : 'Cargando tipo de cambio...'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={!paymentType}
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="mr-2 h-4 w-4" /> {t.addButton}
            </button>
          </form>
          </div>

          {/* ── GRÁFICA (Solo visible cuando filterMode === 'range') ── */}
          {filterMode === 'range' && (filterFrom || filterTo) && (
            <div data-tour="expense-chart">
              <ExpenseChart
                debts={filteredDebts}
                filterFrom={filterFrom}
                filterTo={filterTo}
              />
            </div>
          )}
        </div>

        {/* ── TABLA ── */}
        <div className="lg:col-span-2 rounded-xl border bg-card text-card-foreground shadow-md p-6">

          {/* Encabezado con total */}
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <h3 className="font-semibold leading-none tracking-tight">{t.activeDebtsTitle}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.activeDebtsSubtitle}</p>
            </div>
            {filterMode === 'range' && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-right">
                <p className="text-xs text-muted-foreground leading-none mb-1">Total a pagar</p>
                <p className="text-lg font-bold text-primary leading-none">
                  ${(filterFrom || filterTo
                    ? totalEffectiveCost
                    : 0
                  ).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>

          {/* ── FILTROS ── */}
          <div className="mb-4 p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{t.filterLabel}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['none', 'range'] as const).map(mode => (
                <button key={mode} type="button" onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${filterMode === mode ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-input hover:bg-muted'}`}>
                  {mode === 'none' ? t.filterNone : t.filterRange}
                </button>
              ))}
            </div>

            {filterMode === 'range' && (
              <div className="mt-3 flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">{t.filterFromLabel}</label>
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
                  <label className="text-xs text-muted-foreground block mb-1">{t.filterToLabel}</label>
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
            <div className="text-center text-muted-foreground py-10">{t.loading}</div>
          ) : debts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg bg-muted/20">
              {t.empty}
            </div>
          ) : filteredDebts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg bg-muted/20">
              {t.emptyFiltered}
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">Categoría</th>
                    <th className="h-11 px-4 text-left align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">{t.colDesc}</th>
                    <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">{t.colDate}</th>
                    <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">{t.colType}</th>
                    <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">{t.colPrice}</th>
                    <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">{t.colRemaining}</th>
                    <th className="h-11 px-4 text-center align-middle font-semibold text-xs uppercase tracking-wide text-muted-foreground">{t.colAction}</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredDebts.map((debt) => (
                    <tr
                      key={debt.id}
                      onClick={() => setSelectedDebt(debt)}
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
                            handleDelete(debt);
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
      </div>

      {/* Modal de Detalles y Edición de Deuda */}
      {selectedDebt && (
        <DebtDetailsModal 
          debt={selectedDebt} 
          onClose={() => setSelectedDebt(null)} 
          onUpdated={async () => {
            try {
              const res = await api.get('/api/debts/');
              setDebts(res.data);
              // Actualizamos el selectedDebt con los datos frescos para que la vista se actualice sin cerrarse
              const updated = res.data.find((d: any) => d.id === selectedDebt.id);
              if (updated) setSelectedDebt(updated);
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}

    </div>
  );
}
