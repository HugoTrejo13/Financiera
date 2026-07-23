import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Plus, Check, Sparkles, Loader2 } from 'lucide-react';
import type { Category } from '../../hooks/useCategories';
import type { Debt } from '../../hooks/useDebts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '../../store/useAppStore';
import api from '../../lib/api';

interface DebtFormProps {
  categories: Category[];
  onCreate: (data: any) => Promise<boolean>;
  currentExchangeRate: number | null;
  selectedMonth?: string;
  debts?: Debt[];
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

export default function DebtForm({ categories, onCreate, currentExchangeRate, selectedMonth, debts }: DebtFormProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const addNotification = useAppStore(state => state.addNotification);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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

  useEffect(() => {
    if (selectedMonth) {
      const todayStr = new Date().toISOString().split('T')[0];
      const currentMonthStr = todayStr.slice(0, 7);
      if (selectedMonth === currentMonthStr) {
        setValue('purchase_date', todayStr);
      } else {
        setValue('purchase_date', `${selectedMonth}-01`);
      }
    }
  }, [selectedMonth, setValue]);

  const getMinDate = () => {
    if (!selectedMonth) return undefined;
    return `${selectedMonth}-01`;
  };

  const getMaxDate = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!selectedMonth) return todayStr;
    const currentMonthStr = todayStr.slice(0, 7);
    if (selectedMonth === currentMonthStr) return todayStr;
    const [year, month] = selectedMonth.split('-');
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    return `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;
  };

  const paymentType = watch('payment_type');
  const hasInterest = watch('has_interest');
  const currency = watch('currency');
  const isImpulsive = watch('is_impulsive');
  const selectedCategoryId = watch('category_id');
  const descriptionVal = watch('description');
  const priceStrVal = watch('priceStr');

  const isFormComplete = Boolean(
    selectedCategoryId &&
    selectedCategoryId >= 1 &&
    descriptionVal &&
    descriptionVal.trim() !== '' &&
    priceStrVal &&
    priceStrVal.trim() !== '' &&
    paymentType &&
    (paymentType as string) !== ''
  );

  // 1. Conteo de frecuencia por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    if (debts) {
      debts.forEach(d => {
        if (d.category_id) {
          counts[d.category_id] = (counts[d.category_id] || 0) + 1;
        }
      });
    }
    return counts;
  }, [debts]);

  // 2. Ordenar categorías por popularidad de uso del usuario
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const countA = categoryCounts[a.id] || 0;
      const countB = categoryCounts[b.id] || 0;
      if (countB !== countA) return countB - countA;

      const priority = ['Comida', 'Gastos hormiga', 'Transporte', 'Otro'];
      const idxA = priority.indexOf(a.name);
      const idxB = priority.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [categories, categoryCounts]);

  // Las 4 más populares al frente
  const quickCategories = useMemo(() => sortedCategories.slice(0, 4), [sortedCategories]);

  // El resto de categorías en el popover (¡CERO DUPLICACIÓN!)
  const remainingCategories = useMemo(() => sortedCategories.slice(4), [sortedCategories]);

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

  const handleReceiptScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 500;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            try {
              const res = await api.post('/api/ai/scan-receipt', { image_base64: compressedBase64 });
              if (res.data) {
                if (res.data.description) setValue('description', res.data.description, { shouldValidate: true });
                if (res.data.amount) setValue('priceStr', formatWithCommas(res.data.amount.toString()), { shouldValidate: true });
                if (res.data.suggested_category) {
                  const matchedCat = categories.find(c => c.name.toLowerCase() === res.data.suggested_category.toLowerCase());
                  if (matchedCat) setValue('category_id', matchedCat.id, { shouldValidate: true });
                }
                addNotification({
                  title: '✨ Recibo detectado con IA',
                  message: 'Datos autocompletados correctamente.'
                });
              }
            } catch (err) {
              addNotification({
                title: 'Error de escaneo',
                message: 'No se pudo procesar la imagen del recibo.'
              });
            } finally {
              setIsScanning(false);
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold leading-none tracking-tight">Nueva compra</h3>
          <p className="text-sm text-muted-foreground mt-1">Agrega un nuevo gasto a tu portafolio.</p>
        </div>
        <button
          type="button"
          onClick={() => receiptInputRef.current?.click()}
          disabled={isScanning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer shadow-sm"
        >
          {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
          <span>{isScanning ? 'Escaneando...' : 'Ticket IA'}</span>
        </button>
        <input type="file" ref={receiptInputRef} onChange={handleReceiptScan} accept="image/*" className="hidden" />
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
                    {remainingCategories.map((cat) => {
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
                min={getMinDate()}
                max={getMaxDate()}
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

        <button 
          type="submit" 
          disabled={!isFormComplete}
          className={`inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all h-12 px-4 py-2 w-full mt-6 ${
            isFormComplete
              ? 'bg-foreground text-background hover:bg-foreground/90 shadow-lg cursor-pointer scale-100'
              : 'bg-muted text-muted-foreground/50 border border-border/40 cursor-not-allowed opacity-60'
          }`}
        >
          <Plus className="h-4 w-4" /> Añadir Compra
        </button>
      </form>
    </div>
  );
}
