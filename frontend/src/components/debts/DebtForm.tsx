import { useState, useRef } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import type { Category } from '../../hooks/useCategories';

interface DebtFormProps {
  categories: Category[];
  onCreate: (data: any) => Promise<boolean>;
  currentExchangeRate: number | null;
}

export default function DebtForm({ categories, onCreate, currentExchangeRate }: DebtFormProps) {
  const [paymentType, setPaymentType] = useState<'contado' | 'meses' | ''>('');
  const [hasInterest, setHasInterest] = useState<'si' | 'no' | ''>('');
  const [priceStr, setPriceStr] = useState<string>('');
  const [currency, setCurrency] = useState<'mxn' | 'usd'>('mxn');
  const [isImpulsive, setIsImpulsive] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
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

  const handleAddDebt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const form = new FormData(formElement);

    const rawPrice = parseFloat(priceStr.replace(/,/g, ''));
    const finalPrice = currency === 'usd' ? rawPrice * (currentExchangeRate || 1) : rawPrice;

    const data = {
      description: form.get('description'),
      purchase_date: form.get('purchase_date'),
      payment_type: paymentType,
      price: finalPrice,
      months: paymentType === 'meses' ? parseInt(form.get('months') as string) : null,
      has_interest: paymentType === 'meses' ? (hasInterest === 'si') : null,
      interest_rate: (paymentType === 'meses' && hasInterest === 'si')
        ? parseFloat(form.get('interestRate') as string) : 0,
      category_id: selectedCategory,
    };

    const success = await onCreate(data);
    if (success) {
      formElement.reset();
      setPaymentType('');
      setHasInterest('');
      setPriceStr('');
      setCurrency('mxn');
      setIsImpulsive(null);
      setSelectedCategory(null);
    }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
  const labelClass = "text-sm font-medium leading-none block mb-2 mt-4 text-foreground";

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6" data-tour="add-expense">
      <div className="flex flex-col space-y-1.5 mb-5">
        <h3 className="font-semibold leading-none tracking-tight">Nueva compra</h3>
        <p className="text-sm text-muted-foreground">Agrega un nuevo gasto a tu portafolio.</p>
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
          <label htmlFor="desc" className={labelClass}>Descripción de la compra</label>
          <input id="desc" name="description" type="text" required placeholder="Ej. Iphone 17..." className={inputClass} />
        </div>

        {/* Fecha e Impulsiva */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="purchase_date" className={labelClass}>Fecha de la compra</label>
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
          <label className={labelClass}>Tipo de Pago</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button type="button" onClick={() => setPaymentType('contado')}
              className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${paymentType === 'contado' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
              Pago de contado
            </button>
            <button type="button" onClick={() => setPaymentType('meses')}
              className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${paymentType === 'meses' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
              Pago a meses
            </button>
          </div>
        </div>

        {paymentType === 'contado' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
            <div>
              <label htmlFor="price" className={labelClass}>Precio del producto</label>
              <input id="price" name="price" type="text" required placeholder="0.00"
                className={inputClass} value={priceStr} onChange={handlePriceChange} />
            </div>
            <div>
              <label className={labelClass}>Moneda</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button type="button" onClick={() => setCurrency('mxn')}
                  className={`py-2 px-3 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-1.5 ${currency === 'mxn' ? 'bg-green-700/80 text-white border-green-600 shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                  🇲🇽 Peso Mexicano
                </button>
                <button type="button" onClick={() => setCurrency('usd')}
                  className={`py-2 px-3 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-1.5 ${currency === 'usd' ? 'bg-blue-700/80 text-white border-blue-600 shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                  🇺🇸 Dólar (USD)
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

        {paymentType === 'meses' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
            <div>
              <label className={labelClass}>¿Con o sin intereses?</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button type="button" onClick={() => setHasInterest('no')}
                  className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${hasInterest === 'no' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                  Meses sin intereses
                </button>
                <button type="button" onClick={() => setHasInterest('si')}
                  className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${hasInterest === 'si' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                  Con intereses
                </button>
              </div>
            </div>

            {hasInterest !== '' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2 mt-4">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label htmlFor="months" className={labelClass}>¿A cuántos meses?</label>
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
                      <label htmlFor="interestRate" className={labelClass}>Tasa de Interés (%)</label>
                      <input id="interestRate" name="interestRate" type="number" required min="0" step="0.01" placeholder="Ej. 16.0" className={inputClass} />
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="price" className={labelClass}>Precio del producto</label>
                  <input id="price" name="price" type="text" required placeholder="0.00"
                    className={inputClass} value={priceStr} onChange={handlePriceChange} />
                </div>
                <div>
                  <label className={labelClass}>Moneda</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button type="button" onClick={() => setCurrency('mxn')}
                      className={`py-2 px-3 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-1.5 ${currency === 'mxn' ? 'bg-green-700/80 text-white border-green-600 shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                      🇲🇽 Peso Mexicano
                    </button>
                    <button type="button" onClick={() => setCurrency('usd')}
                      className={`py-2 px-3 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-1.5 ${currency === 'usd' ? 'bg-blue-700/80 text-white border-blue-600 shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                      🇺🇸 Dólar (USD)
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
          <Plus className="mr-2 h-4 w-4" /> Añadir Compra
        </button>
      </form>
    </div>
  );
}
