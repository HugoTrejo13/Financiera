import { useRef } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import type { Category } from '../../hooks/useCategories';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface DebtFormProps {
  categories: Category[];
  onCreate: (data: any) => Promise<boolean>;
  currentExchangeRate: number | null;
}

const debtSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  purchase_date: z.string().min(1, 'La fecha es requerida'),
  payment_type: z.enum(['contado', 'meses', '']),
  priceStr: z.string().min(1, 'El precio es requerido'),
  currency: z.enum(['mxn', 'usd']),
  category_id: z.number().nullable(),
  months: z.number().min(1).max(24).nullable().optional(),
  has_interest: z.enum(['si', 'no', '']).nullable().optional(),
  interest_rate: z.number().min(0).nullable().optional(),
  is_impulsive: z.boolean().nullable()
});

type DebtFormValues = z.infer<typeof debtSchema>;

export default function DebtForm({ categories, onCreate, currentExchangeRate }: DebtFormProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      description: '',
      purchase_date: new Date().toISOString().split('T')[0],
      payment_type: '',
      priceStr: '',
      currency: 'mxn',
      category_id: null,
      months: null,
      has_interest: '',
      interest_rate: 0,
      is_impulsive: null
    }
  });

  const paymentType = watch('payment_type');
  const hasInterest = watch('has_interest');
  const currency = watch('currency');
  const isImpulsive = watch('is_impulsive');
  const selectedCategory = watch('category_id');

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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('priceStr', formatWithCommas(e.target.value), { shouldValidate: true });
  };

  const onSubmit = async (values: DebtFormValues) => {
    const rawPrice = parseFloat(values.priceStr.replace(/,/g, ''));
    if (isNaN(rawPrice)) return;
    const finalPrice = values.currency === 'usd' ? rawPrice * (currentExchangeRate || 1) : rawPrice;

    const data = {
      description: values.description,
      purchase_date: values.purchase_date,
      payment_type: values.payment_type,
      price: finalPrice,
      months: values.payment_type === 'meses' ? values.months : null,
      has_interest: values.payment_type === 'meses' ? (values.has_interest === 'si') : null,
      interest_rate: (values.payment_type === 'meses' && values.has_interest === 'si')
        ? values.interest_rate : 0,
      category_id: values.category_id,
    };

    const success = await onCreate(data);
    if (success) {
      reset();
    }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
  const errorClass = "text-[10px] text-destructive mt-1 font-medium";
  const labelClass = "text-sm font-medium leading-none block mb-2 mt-4 text-foreground";

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6" data-tour="add-expense">
      <div className="flex flex-col space-y-1.5 mb-5">
        <h3 className="font-semibold leading-none tracking-tight">Nueva compra</h3>
        <p className="text-sm text-muted-foreground">Agrega un nuevo gasto a tu portafolio.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Categoría */}
        <div>
          <label className={labelClass}>Categoría</label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setValue('category_id', cat.id, { shouldValidate: true })}
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
          <input id="desc" {...register('description')} type="text" placeholder="Ej. Iphone 17..." className={inputClass} />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
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
                {...register('purchase_date')}
                ref={(e) => {
                  register('purchase_date').ref(e);
                  // @ts-ignore
                  dateInputRef.current = e;
                }}
                id="purchase_date" type="date"
                className={inputClass + " pl-9"}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            {errors.purchase_date && <p className={errorClass}>{errors.purchase_date.message}</p>}
          </div>

          <div>
            <label className={labelClass}>¿Compra impulsiva?</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button type="button" onClick={() => setValue('is_impulsive', true)}
                className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${isImpulsive === true ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input text-muted-foreground hover:bg-muted'}`}>
                Sí
              </button>
              <button type="button" onClick={() => setValue('is_impulsive', false)}
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
            <button type="button" onClick={() => setValue('payment_type', 'contado')}
              className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${paymentType === 'contado' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
              Pago de contado
            </button>
            <button type="button" onClick={() => setValue('payment_type', 'meses')}
              className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${paymentType === 'meses' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
              Pago a meses
            </button>
          </div>
          {errors.payment_type && <p className={errorClass}>{errors.payment_type.message}</p>}
        </div>

        {paymentType === 'contado' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
            <div>
              <label htmlFor="price" className={labelClass}>Precio del producto</label>
              <input id="price" {...register('priceStr')} type="text" placeholder="0.00"
                className={inputClass} onChange={handlePriceChange} />
              {errors.priceStr && <p className={errorClass}>{errors.priceStr.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Moneda</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button type="button" onClick={() => setValue('currency', 'mxn')}
                  className={`py-2 px-3 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-1.5 ${currency === 'mxn' ? 'bg-green-700/80 text-white border-green-600 shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                  🇲🇽 Peso Mexicano
                </button>
                <button type="button" onClick={() => setValue('currency', 'usd')}
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
                <button type="button" onClick={() => setValue('has_interest', 'no')}
                  className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${hasInterest === 'no' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                  Meses sin intereses
                </button>
                <button type="button" onClick={() => setValue('has_interest', 'si')}
                  className={`py-2 px-3 text-sm font-medium rounded-md border transition-all ${hasInterest === 'si' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                  Con intereses
                </button>
              </div>
            </div>

            {hasInterest && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2 mt-4">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label htmlFor="months" className={labelClass}>¿A cuántos meses?</label>
                    <input id="months" type="number" min="1" max="24" step="1"
                      placeholder="Ej. 12" className={inputClass}
                      {...register('months', { valueAsNumber: true })}
                    />
                  </div>
                  {hasInterest === 'si' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label htmlFor="interestRate" className={labelClass}>Tasa de Interés (%)</label>
                      <input id="interestRate" type="number" min="0" step="0.01" placeholder="Ej. 16.0" className={inputClass} 
                        {...register('interest_rate', { valueAsNumber: true })}
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="price" className={labelClass}>Precio del producto</label>
                  <input id="price" type="text" placeholder="0.00"
                    className={inputClass} {...register('priceStr')} onChange={handlePriceChange} />
                </div>
                <div>
                  <label className={labelClass}>Moneda</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button type="button" onClick={() => setValue('currency', 'mxn')}
                      className={`py-2 px-3 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-1.5 ${currency === 'mxn' ? 'bg-green-700/80 text-white border-green-600 shadow-sm' : 'bg-transparent border-input hover:bg-muted'}`}>
                      🇲🇽 Peso Mexicano
                    </button>
                    <button type="button" onClick={() => setValue('currency', 'usd')}
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
