import React, { useMemo, useState, useRef } from 'react';
import { X, Calendar, DollarSign, TrendingDown, CheckCircle2, Clock, Info, Edit2, Save, CalendarDays } from 'lucide-react';
import api from '../lib/api';

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
  paid_months?: number;
}

interface DebtDetailsModalProps {
  debt: Debt;
  onClose: () => void;
  onUpdated: () => void;
}

export default function DebtDetailsModal({ debt, onClose, onUpdated }: DebtDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // -- ESTADOS DEL FORMULARIO DE EDICIÓN --
  const [description, setDescription] = useState(debt.description);
  const [purchaseDate, setPurchaseDate] = useState(debt.purchase_date);
  const [paymentType, setPaymentType] = useState(debt.payment_type as 'contado' | 'meses');
  const [localPaidMonths, setLocalPaidMonths] = useState(debt.paid_months || 0);
  
  // Parseamos el price para mostrarlo en el input de texto (como lo manejamos en creación)
  const formatWithCommas = (val: string) => {
    let raw = val.replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('');
    if (raw !== '') {
      const splitVal = raw.split('.');
      splitVal[0] = splitVal[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      raw = splitVal.join('.');
    }
    return raw;
  };

  const [priceStr, setPriceStr] = useState(debt.price.toString());
  const [months, setMonths] = useState(debt.months?.toString() || '');
  const [hasInterest, setHasInterest] = useState<'si' | 'no'>(debt.has_interest ? 'si' : 'no');
  const [interestRate, setInterestRate] = useState(debt.interest_rate?.toString() || '');

  const dateInputRef = useRef<HTMLInputElement>(null);

  // -- LÓGICA DE CÁLCULO DE MESES Y AMORTIZACIÓN (VISTA LECTURA) --
  const { monthsElapsed, totalMonths, isCompleted, amortization } = useMemo(() => {
    const start = new Date(debt.purchase_date);
    
    const total = debt.payment_type === 'meses' && debt.months ? debt.months : 1;
    const cappedElapsed = Math.min(localPaidMonths, total);
    
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
  }, [debt, localPaidMonths]);

  // -- CÁLCULOS FINANCIEROS (VISTA LECTURA) --
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

  const fmtCurrency = (val: number) => val.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  const fmtDate = (d: string | Date) => {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    return dateObj.toLocaleDateString('es-MX', { month: 'short', year: 'numeric', day: 'numeric' });
  };

  // -- HANDLERS PARA EDICIÓN --
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rawPrice = parseFloat(priceStr.replace(/,/g, ''));
      const payload = {
        description,
        purchase_date: purchaseDate,
        payment_type: paymentType,
        price: rawPrice,
        months: paymentType === 'meses' ? parseInt(months) : null,
        has_interest: paymentType === 'meses' ? (hasInterest === 'si') : null,
        interest_rate: (paymentType === 'meses' && hasInterest === 'si') ? parseFloat(interestRate) : 0,
      };

      await api.put(`/api/debts/${debt.id}`, payload);
      onUpdated(); // Refresca los datos en la vista principal
      setIsEditing(false); // Sale del modo edición
    } catch (err) {
      console.error('Error al editar deuda', err);
      alert('Error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMonthStatus = async (monthIndex: number, currentStatus: string) => {
    if (debt.payment_type !== 'meses') return;
    
    const newPaidMonths = currentStatus === 'paid' ? monthIndex - 1 : monthIndex;
    setLocalPaidMonths(newPaidMonths);
    
    try {
      await api.put(`/api/debts/${debt.id}`, { paid_months: newPaidMonths });
      onUpdated();
    } catch (err) {
      console.error('Error toggling month status', err);
      setLocalPaidMonths(debt.paid_months || 0);
      alert('Error al actualizar el pago.');
    }
  };

  // Clases compartidas para los inputs del formulario
  const labelClass = "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1";
  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow";

  return (
    <>
      {/* Overlay oscuro para enfocar el panel */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-300 flex items-center justify-center p-4 md:p-6"
        onClick={onClose}
      >
        {/* Modal Window */}
        <div 
          className="bg-card w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-200 border border-border"
          onClick={e => e.stopPropagation()} // Evita que se cierre al dar clic dentro del modal
        >
          
          {/* Encabezado */}
          <header className="flex items-center justify-between p-6 border-b border-border bg-muted/10 shrink-0">
            <div>
              <h2 className="text-2xl font-bold tracking-tight line-clamp-1">{isEditing ? 'Editar Compra' : debt.description}</h2>
              {!isEditing && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4" /> Comprado el {fmtDate(debt.purchase_date)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Cuerpo (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 bg-background">
            
            {isEditing ? (
              // VISTA DE EDICIÓN (FORMULARIO)
              <form id="editDebtForm" onSubmit={handleSave} className="max-w-2xl mx-auto space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="edit_desc" className={labelClass}>Descripción</label>
                    <input id="edit_desc" type="text" required className={inputClass} value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="edit_date" className={labelClass}>Fecha de compra</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => dateInputRef.current?.showPicker()} />
                      <input ref={dateInputRef} id="edit_date" type="date" required className={inputClass + " pl-9"} max={new Date().toISOString().split('T')[0]} value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Tipo de Pago</label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button type="button" onClick={() => setPaymentType('contado')} className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${paymentType === 'contado' ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-input hover:bg-muted'}`}>Contado</button>
                      <button type="button" onClick={() => setPaymentType('meses')} className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${paymentType === 'meses' ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-input hover:bg-muted'}`}>A Meses</button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="edit_price" className={labelClass}>Precio Total (MXN)</label>
                    <input id="edit_price" type="text" required className={inputClass} value={priceStr} onChange={e => setPriceStr(formatWithCommas(e.target.value))} />
                  </div>
                </div>

                {paymentType === 'meses' && (
                  <div className="p-5 border border-border rounded-xl bg-muted/20 space-y-6">
                    <div>
                      <label className={labelClass}>¿Con o sin intereses?</label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button type="button" onClick={() => setHasInterest('no')} className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${hasInterest === 'no' ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-input hover:bg-muted'}`}>Sin Intereses</button>
                        <button type="button" onClick={() => setHasInterest('si')} className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${hasInterest === 'si' ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-input hover:bg-muted'}`}>Con Intereses</button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="edit_months" className={labelClass}>Número de Meses</label>
                        <input id="edit_months" type="number" required min="1" max="24" className={inputClass} value={months} onChange={e => setMonths(e.target.value)} />
                      </div>
                      {hasInterest === 'si' && (
                        <div className="animate-in fade-in duration-300">
                          <label htmlFor="edit_interest" className={labelClass}>Tasa de Interés (%)</label>
                          <input id="edit_interest" type="number" required min="0" step="0.01" className={inputClass} value={interestRate} onChange={e => setInterestRate(e.target.value)} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
              </form>
            ) : (
              // VISTA DE LECTURA (GRID DE DETALLES ROBUSTO)
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                
                {/* Columna Izquierda: Resumen Financiero */}
                <div className="space-y-8">
                  <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" /> Desglose Financiero
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm md:text-base">
                        <span className="text-muted-foreground">Valor original (Capital)</span>
                        <span className="font-medium text-foreground">{fmtCurrency(principal)}</span>
                      </div>
                      
                      {debt.payment_type === 'meses' && debt.has_interest && (
                        <div className="flex justify-between items-center text-sm md:text-base">
                          <span className="text-muted-foreground flex items-center gap-1">
                            Intereses ({debt.interest_rate}%) <Info className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-medium text-destructive">+{fmtCurrency(interest)}</span>
                        </div>
                      )}
                      
                      <div className="h-px w-full bg-primary/20 my-4" />
                      
                      <div className="flex justify-between items-end">
                        <span className="font-semibold text-foreground text-lg">Costo Total Final</span>
                        <span className="text-3xl font-bold text-primary tabular-nums tracking-tight">
                          {fmtCurrency(principal + interest)}
                        </span>
                      </div>
                    </div>
                  </section>

                  {debt.payment_type === 'meses' && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">Progreso de Pago</h3>
                        <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-muted text-foreground">
                          {monthsElapsed} de {totalMonths} meses
                        </span>
                      </div>
                      
                      <div className="w-full h-4 bg-muted rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-base">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Pagado</span>
                          <span className="font-bold text-foreground">{fmtCurrency(totalPaid)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-sm text-muted-foreground">Restante</span>
                          <span className="font-bold text-foreground">{fmtCurrency(remaining)}</span>
                        </div>
                      </div>
                    </section>
                  )}
                </div>

                {/* Columna Derecha: Calendario (Solo para Meses) */}
                <div>
                  {debt.payment_type === 'meses' ? (
                    <section>
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <TrendingDown className="w-6 h-6 text-muted-foreground" />
                        Calendario de Mensualidades
                      </h3>
                      
                      {amortization.length > 0 ? (
                        <div className="pr-4 max-h-[400px] overflow-y-auto space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                          {amortization.map((payment, idx) => (
                            <div key={idx} className="relative flex items-center group is-active">
                              <div 
                                onClick={() => toggleMonthStatus(payment.month, payment.status)}
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-card shrink-0 shadow-sm z-10 cursor-pointer transition-transform hover:scale-110 active:scale-95 ${payment.status === 'paid' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'}`}
                                title={payment.status === 'paid' ? 'Desmarcar como pagado' : 'Marcar como pagado'}
                              >
                                {payment.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
                              </div>
                              <div className="ml-6 w-full p-4 rounded-xl border border-border bg-card shadow-sm transition-colors hover:bg-muted/30">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`font-bold text-base ${payment.status === 'paid' ? 'text-green-500' : 'text-foreground'}`}>
                                    Mensualidad {payment.month}
                                  </span>
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {fmtDate(payment.date)}
                                  </span>
                                </div>
                                <div className="text-base font-medium text-muted-foreground">
                                  {fmtCurrency(debt.monthly_payment)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No hay calendario disponible.</p>
                      )}
                    </section>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-2xl bg-muted/10">
                      <CheckCircle2 className="w-16 h-16 text-green-500/50 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Compra de Contado</h3>
                      <p className="text-muted-foreground max-w-sm">Esta compra se registró como pago único. No hay calendario de amortización que mostrar.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
          
          {/* Footer del Modal (Acciones) */}
          <footer className="p-4 md:p-6 border-t border-border bg-muted/10 shrink-0 flex justify-end gap-3">
            {isEditing ? (
              <>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 rounded-xl border border-border bg-background hover:bg-muted font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  form="editDebtForm"
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </>
            ) : (
              <button 
                onClick={onClose}
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold transition-colors"
              >
                Cerrar Detalles
              </button>
            )}
          </footer>
        </div>
      </div>
    </>
  );
}
