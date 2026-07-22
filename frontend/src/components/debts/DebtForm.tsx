import { useRef, useState } from 'react';
import { CalendarDays, Plus, Check } from 'lucide-react';
import type { Category } from '../../hooks/useCategories';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '../../store/useAppStore';

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
  category_id: z.number().min(1, 'La categoría es obligatoria'),
  months: z.number().min(1).max(24).nullable().optional(),
  has_interest: z.enum(['si', 'no', '']).nullable().optional(),
  interest_rate: z.number().min(0).nullable().optional(),
  is_impulsive: z.boolean().nullable()
});

type DebtFormValues = z.infer<typeof debtSchema>;

export default function DebtForm({ categories, onCreate, currentExchangeRate }: DebtFormProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const addNotification = useAppStore(state => state.addNotification);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      description: '',
      purchase_date: new Date().toISOString().split('T')[0],
      payment_type: '',
      priceStr: '',
      currency: 'mxn',
      category_id: 0,
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
  const selectedCategoryId = watch('category_id');

  // Comida y Gastos hormiga siempre al frente
  const sortedCategories = [
    categories.find(c => c.name === 'Comida'),
    categories.find(c => c.name === 'Gastos hormiga'),
    categories.find(c => c.name === 'Transporte'),
    categories.find(c => c.name === 'Otro'),
    ...categories.filter(c => !['Comida', 'Gastos hormiga', 'Transporte', 'Otro'].includes(c.name))
  ].filter(Boolean) as Category[];

  const quickCategories = sortedCategories.slice(0, 4);
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

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
    try {
      const rawPrice = parseFloat(values.priceStr.replace(/,/g, ''));
      if (isNaN(rawPrice) || rawPrice <= 0) {
        addNotification({
          title: 'Error de validación',
          message: 'Por favor ingresa un precio válido.'
        });
        return;
      }
      
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
        addNotification({
          title: 'Nueva compra',
          message: 'Se añadió correctamente tu gasto',
          path: '/gastos'
        });
        reset();
        setIsCategoryModalOpen(false);
      } else {
        addNotification({
          title: 'Error al registrar',
          message: 'No se pudo crear la compra. Por favor intenta de nuevo.'
        });
      }
    } catch (error) {
      addNotification({
        title: 'Error inesperado',
        message: 'Ha ocurrido un problema procesando la compra.'
      });
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
        {/* Categoría Obligatoria (Diseño Híbrido: Chips + Popover Grid) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium leading-none text-foreground">
              Categoría <span className="text-destructive">*</span>
            </label>
            {selectedCategory && (
              <span className="text-xs font-semibold text-primary flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 animate-in fade-in duration-200">
                {selectedCategory.icon} {selectedCategory.name}
              </span>
            )}
          </div>

          {categories.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-border bg-muted/20 text-center">
              <p className="text-sm text-muted-foreground">
                No hay categorías disponibles.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Chips Rápidos + Botón Popover */}
              <div className="flex flex-wrap items-center gap-2">
                {quickCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setValue('category_id', cat.id, { shouldValidate: true })}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                          : 'bg-background hover:bg-muted text-muted-foreground border-input hover:text-foreground'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                      {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(!isCategoryModalOpen)}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed transition-all cursor-pointer ${
                    isCategoryModalOpen || (selectedCategory && !quickCategories.some(c => c.id === selectedCategoryId))
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {selectedCategory && !quickCategories.some(c => c.id === selectedCategoryId)
                      ? selectedCategory.name
                      : 'Más categorías'}
                  </span>
                </button>
              </div>

              {errors.category_id && (
                <p className={errorClass}>{errors.category_id.message}</p>
              )}

              {/* Popover Grid 3x4 con todas las categorías */}
              {isCategoryModalOpen && (
                <div className="p-3 border border-border/80 rounded-2xl bg-card shadow-xl mt-2 animate-in fade-in zoom-in-95 duration-150 border-primary/20">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50 text-xs font-bold text-muted-foreground">
                    <span>Selecciona una Categoría</span>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="p-1 hover:bg-muted rounded-md transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-1">
                    {sortedCategories.map((cat) => {
                      const isSelected = selectedCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setValue('category_id', cat.id, { shouldValidate: true });
                            setIsCategoryModalOpen(false);
                          }}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm'
                              : 'bg-background hover:bg-muted border-border text-foreground hover:border-primary/50'
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span className="truncate">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
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
