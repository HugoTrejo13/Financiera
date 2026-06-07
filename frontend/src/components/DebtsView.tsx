import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import api from '../lib/api';

interface Debt {
  id: number;
  description: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  monthly_payment: number;
  due_date: string;
}

interface DebtsViewProps {
  lang?: 'es' | 'en';
  onBack?: () => void;
}

export default function DebtsView({ lang = 'es', onBack }: DebtsViewProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  // Traducciones
  const texts = {
    es: {
      headerTitle: "Gestión de Deudas",
      headerSubtitle: "Administra tus pasivos y simula tus planes de pago de manera eficiente.",
      newDebtTitle: "Nueva Deuda",
      newDebtSubtitle: "Agrega una nueva deuda a tu portafolio.",
      descLabel: "Descripción",
      descPlaceholder: "Ej. Iphone 17",
      amountLabel: "Monto Total",
      interestLabel: "Interés (%)",
      paymentLabel: "Pago Mensual",
      dateLabel: "Fecha de compra",
      addButton: "Añadir Deuda",
      activeDebtsTitle: "Tus Deudas Activas",
      activeDebtsSubtitle: "Visualiza y gestiona tus pasivos actuales.",
      loading: "Cargando deudas...",
      empty: "No tienes deudas registradas. ¡Excelente trabajo financiero!",
      colDesc: "Descripción",
      colRemaining: "Monto Restante",
      colInterest: "Interés",
      colDate: "Vencimiento",
      colAction: "Acción",
      errorCreate: "Error al crear deuda",
    },
    en: {
      headerTitle: "Debt Management",
      headerSubtitle: "Manage your liabilities and simulate your payment plans efficiently.",
      newDebtTitle: "New Debt",
      newDebtSubtitle: "Add a new debt to your portfolio.",
      descLabel: "Description",
      descPlaceholder: "e.g. Credit Card",
      amountLabel: "Total Amount",
      interestLabel: "Interest (%)",
      paymentLabel: "Monthly Payment",
      dateLabel: "Due Date",
      addButton: "Add Debt",
      activeDebtsTitle: "Your Active Debts",
      activeDebtsSubtitle: "View and manage your current liabilities.",
      loading: "Loading debts...",
      empty: "No debts registered. Great financial job!",
      colDesc: "Description",
      colRemaining: "Remaining Amount",
      colInterest: "Interest",
      colDate: "Due Date",
      colAction: "Action",
      errorCreate: "Error creating debt",
    }
  };

  const t = texts[lang];

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

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleAddDebt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    try {
      await api.post('/api/debts/', {
        description: form.get('description'),
        total_amount: parseFloat(form.get('totalAmount') as string),
        interest_rate: parseFloat(form.get('interestRate') as string),
        monthly_payment: parseFloat(form.get('monthlyPayment') as string),
        due_date: form.get('dueDate'),
      });
      formElement.reset();
      fetchDebts();
    } catch (err) {
      console.error('Error creating debt', err);
      alert(t.errorCreate);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/debts/${id}`);
      fetchDebts();
    } catch (err) {
      console.error('Error deleting debt', err);
    }
  };

  // Clases compartidas para reducir código visual
  const inputClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  const labelClass = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2";

  return (
    <div className="p-6 md:p-10 min-h-screen bg-background text-foreground relative">
      
      {/* Botón Logo Superior Derecha (Regresar al Inicio) */}
      <button 
        onClick={onBack}
        className="absolute top-6 right-6 p-3 rounded-full bg-card border border-border shadow-sm transition-transform hover:scale-110 hover:bg-muted group"
        title="Go to Lobby / Cambiar Idioma"
      >
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
        {/* Formulario NATIVO */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
          <div className="flex flex-col space-y-1.5 mb-5">
            <h3 className="font-semibold leading-none tracking-tight">{t.newDebtTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.newDebtSubtitle}</p>
          </div>
          
          <form onSubmit={handleAddDebt} className="space-y-4">
            <div>
              <label htmlFor="desc" className={labelClass}>{t.descLabel}</label>
              <input id="desc" name="description" type="text" required placeholder={t.descPlaceholder} className={inputClass} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="monto" className={labelClass}>{t.amountLabel}</label>
                <input id="monto" name="totalAmount" type="number" required min="0" step="0.01" placeholder="0.00" className={inputClass} />
              </div>
              <div>
                <label htmlFor="interes" className={labelClass}>{t.interestLabel}</label>
                <input id="interes" name="interestRate" type="number" required min="0" step="0.01" placeholder="0.0" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pago" className={labelClass}>{t.paymentLabel}</label>
                <input id="pago" name="monthlyPayment" type="number" required min="0" step="0.01" placeholder="0.00" className={inputClass} />
              </div>
              <div>
                <label htmlFor="fecha" className={labelClass}>{t.dateLabel}</label>
                <input id="fecha" name="dueDate" type="date" required className={inputClass} />
              </div>
            </div>

            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-4 cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> {t.addButton}
            </button>
          </form>
        </div>

        {/* Tabla / Lista NATIVA */}
        <div className="lg:col-span-2 rounded-xl border bg-card text-card-foreground shadow-md p-6">
          <div className="flex flex-col space-y-1.5 mb-5">
            <h3 className="font-semibold leading-none tracking-tight">{t.activeDebtsTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.activeDebtsSubtitle}</p>
          </div>
          
          {loading ? (
            <div className="text-center text-muted-foreground py-10">{t.loading}</div>
          ) : debts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg bg-muted/20">
              {t.empty}
            </div>
          ) : (
            <div className="relative w-full overflow-auto rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">{t.colDesc}</th>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground text-right">{t.colRemaining}</th>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground text-right">{t.colInterest}</th>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground text-center">{t.colDate}</th>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground text-center">{t.colAction}</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {debts.map((debt) => (
                    <tr key={debt.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{debt.description}</td>
                      <td className="p-4 align-middle text-right">${debt.remaining_amount.toLocaleString()}</td>
                      <td className="p-4 align-middle text-right">{debt.interest_rate}%</td>
                      <td className="p-4 align-middle text-center text-muted-foreground">{debt.due_date}</td>
                      <td className="p-4 align-middle text-center">
                        <button onClick={() => handleDelete(debt.id)} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 text-destructive h-9 w-9 cursor-pointer">
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
    </div>
  );
}
