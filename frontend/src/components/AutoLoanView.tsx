import React, { useState, useMemo } from 'react';
import { Car, TrendingUp, DollarSign, Calendar, Building2, PiggyBank, Shield, Download } from 'lucide-react';
import { generateAutoLoanPDF } from '../lib/pdfGenerator';

export default function AutoLoanView() {
  // Estados del formulario
  const [carValue, setCarValue] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [years, setYears] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [insurance, setInsurance] = useState<string>('');
  const [extraPayments, setExtraPayments] = useState<string>('0');
  
  // Estado para mostrar resultados
  const [showResults, setShowResults] = useState(false);

  // Formatear números con comas
  const formatWithCommas = (value: string): string => {
    let val = value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    if (val !== '') {
      const splitVal = val.split('.');
      splitVal[0] = splitVal[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      val = splitVal.join('.');
    }
    return val;
  };

  // Calcular amortización
  const calculations = useMemo(() => {
    if (!carValue || !downPayment || !interestRate || !years) {
      return null;
    }

    const car = parseFloat(carValue.replace(/,/g, ''));
    const down = parseFloat(downPayment.replace(/,/g, ''));
    const rate = parseFloat(interestRate) / 100 / 12; // Tasa mensual
    const totalMonths = parseInt(years) * 12;
    const extra = parseFloat(extraPayments.replace(/,/g, '')) || 0;
    const monthlyInsurance = parseFloat(insurance.replace(/,/g, '')) || 0;

    // Monto del crédito
    const loanAmount = car - down;

    // Pago mensual del crédito (fórmula de amortización)
    const monthlyLoanPayment = loanAmount * (rate * Math.pow(1 + rate, totalMonths)) / (Math.pow(1 + rate, totalMonths) - 1);

    // Pago mensual total (crédito + seguro)
    // Unused var removed

    // Generar tabla de amortización
    let balance = loanAmount;
    const schedule = [];
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    let totalInsurancePaid = 0;

    for (let month = 1; month <= totalMonths && balance > 0; month++) {
      const interestPayment = balance * rate;
      let principalPayment = monthlyLoanPayment - interestPayment + extra;
      
      // Si el pago principal es mayor que el saldo, ajustar
      if (principalPayment > balance) {
        principalPayment = balance;
      }

      balance -= principalPayment;
      totalInterestPaid += interestPayment;
      totalPrincipalPaid += principalPayment - extra;
      totalInsurancePaid += monthlyInsurance;

      schedule.push({
        month,
        loanPayment: monthlyLoanPayment + extra,
        insurance: monthlyInsurance,
        totalPayment: monthlyLoanPayment + extra + monthlyInsurance,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
      });

      if (balance <= 0) break;
    }

    return {
      carValue: car,
      downPayment: down,
      downPaymentPercent: (down / car) * 100,
      loanAmount,
      monthlyLoanPayment,
      monthlyInsurance,
      totalMonthlyPayment: monthlyLoanPayment + monthlyInsurance + extra,
      totalMonths,
      actualMonths: schedule.length,
      totalInterest: totalInterestPaid,
      totalInsurance: totalInsurancePaid,
      totalPrincipal: totalPrincipalPaid,
      totalCost: car + totalInterestPaid + totalInsurancePaid,
      schedule,
      extraPayments: extra,
    };
  }, [carValue, downPayment, interestRate, years, insurance, extraPayments]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const handleDownloadPDF = () => {
    if (!calculations) return;
    
    generateAutoLoanPDF({
      bankName,
      carValue: calculations.carValue,
      downPayment: calculations.downPayment,
      downPaymentPercent: calculations.downPaymentPercent,
      loanAmount: calculations.loanAmount,
      monthlyLoanPayment: calculations.monthlyLoanPayment,
      monthlyInsurance: calculations.monthlyInsurance,
      totalMonthlyPayment: calculations.totalMonthlyPayment,
      totalMonths: calculations.totalMonths,
      actualMonths: calculations.actualMonths,
      totalInterest: calculations.totalInterest,
      totalInsurance: calculations.totalInsurance,
      totalPrincipal: calculations.totalPrincipal,
      totalCost: calculations.totalCost,
      extraPayments: calculations.extraPayments,
      interestRate,
      schedule: calculations.schedule,
    });
  };

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
  const labelClass = "text-sm font-medium leading-none block mb-2 text-foreground";

  return (
    <div className="p-6 md:p-10 min-h-screen bg-background text-foreground">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
          <Car className="text-primary w-8 h-8" />
          Crédito Automotriz
        </h1>
        <p className="text-muted-foreground mt-2">
          Simula y da seguimiento a tu crédito automotriz aprobado
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6 sticky top-6">
            <h3 className="font-semibold text-lg mb-5">Datos del Crédito</h3>
            
            <form onSubmit={handleCalculate} className="space-y-4">
              {/* Institución Bancaria */}
              <div>
                <label htmlFor="bank" className={labelClass}>
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Institución Financiera
                </label>
                <input
                  id="bank"
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ej. Santander, BBVA, Scotiabank..."
                  className={inputClass}
                  required
                />
              </div>

              {/* Valor del Auto */}
              <div>
                <label htmlFor="car" className={labelClass}>
                  <Car className="w-4 h-4 inline mr-2" />
                  Valor Total del Vehículo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    id="car"
                    type="text"
                    value={carValue}
                    onChange={(e) => setCarValue(formatWithCommas(e.target.value))}
                    placeholder="0.00"
                    className={inputClass + " pl-7"}
                    required
                  />
                </div>
              </div>

              {/* Enganche */}
              <div>
                <label htmlFor="down" className={labelClass}>
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Enganche
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    id="down"
                    type="text"
                    value={downPayment}
                    onChange={(e) => setDownPayment(formatWithCommas(e.target.value))}
                    placeholder="0.00"
                    className={inputClass + " pl-7"}
                    required
                  />
                </div>
                {carValue && downPayment && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {((parseFloat(downPayment.replace(/,/g, '')) / parseFloat(carValue.replace(/,/g, ''))) * 100).toFixed(1)}% del valor
                  </p>
                )}
              </div>

              {/* Tasa de Interés */}
              <div>
                <label htmlFor="rate" className={labelClass}>
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Tasa de Interés Anual (%)
                </label>
                <input
                  id="rate"
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="Ej. 12.5"
                  className={inputClass}
                  required
                />
              </div>

              {/* Plazo */}
              <div>
                <label htmlFor="years" className={labelClass}>
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Plazo (años)
                </label>
                <input
                  id="years"
                  type="number"
                  min="1"
                  max="7"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="Ej. 5"
                  className={inputClass}
                  required
                />
              </div>

              {/* Seguro Mensual */}
              <div>
                <label htmlFor="insurance" className={labelClass}>
                  <Shield className="w-4 h-4 inline mr-2" />
                  Seguro Mensual
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    id="insurance"
                    type="text"
                    value={insurance}
                    onChange={(e) => setInsurance(formatWithCommas(e.target.value))}
                    placeholder="0.00"
                    className={inputClass + " pl-7"}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Costo mensual del seguro del vehículo
                </p>
              </div>

              {/* Aportaciones Extras a Capital */}
              <div>
                <label htmlFor="extra" className={labelClass}>
                  <PiggyBank className="w-4 h-4 inline mr-2" />
                  Aportaciones Extras Mensuales
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    id="extra"
                    type="text"
                    value={extraPayments}
                    onChange={(e) => setExtraPayments(formatWithCommas(e.target.value))}
                    placeholder="0.00"
                    className={inputClass + " pl-7"}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Opcional: Pagos adicionales para reducir el plazo
                </p>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
              >
                Calcular Amortización
              </button>
            </form>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2">
          {!showResults || !calculations ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 border-2 border-dashed rounded-xl bg-muted/20">
              <Car className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-bold mb-2">Completa el formulario</h3>
              <p className="text-muted-foreground max-w-md">
                Ingresa los datos de tu crédito automotriz para ver la simulación completa de amortización
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Resumen del Crédito</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{bankName}</span>
                    <button
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Monto del Crédito</p>
                    <p className="text-lg font-bold text-primary">
                      ${calculations.loanAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Pago Mensual Total</p>
                    <p className="text-lg font-bold text-foreground">
                      ${calculations.totalMonthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Crédito + Seguro)
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Intereses Totales</p>
                    <p className="text-lg font-bold text-destructive">
                      ${calculations.totalInterest.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Costo Total</p>
                    <p className="text-lg font-bold text-foreground">
                      ${calculations.totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Auto + Intereses + Seguros)
                    </p>
                  </div>
                </div>

                {/* Desglose adicional */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Pago Mensual del Crédito</p>
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                      ${calculations.monthlyLoanPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Seguro Total Pagado</p>
                    <p className="text-base font-bold text-purple-600 dark:text-purple-400">
                      ${calculations.totalInsurance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {calculations.extraPayments > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      💡 Con aportaciones extras de ${calculations.extraPayments.toLocaleString('es-MX')} mensuales, 
                      terminarás de pagar en {calculations.actualMonths} meses ({(calculations.actualMonths / 12).toFixed(1)} años) 
                      en lugar de {calculations.totalMonths} meses ({years} años)
                    </p>
                  </div>
                )}
              </div>

              {/* Tabla de Amortización */}
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-xl font-bold mb-4">Tabla de Amortización</h3>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Mes</th>
                        <th className="text-right p-3 font-semibold">Pago Crédito</th>
                        <th className="text-right p-3 font-semibold">Seguro</th>
                        <th className="text-right p-3 font-semibold">Total</th>
                        <th className="text-right p-3 font-semibold">Capital</th>
                        <th className="text-right p-3 font-semibold">Interés</th>
                        <th className="text-right p-3 font-semibold">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculations.schedule.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3">{row.month}</td>
                          <td className="p-3 text-right tabular-nums">
                            ${row.loanPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right tabular-nums text-purple-600 dark:text-purple-400">
                            ${row.insurance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right tabular-nums font-medium">
                            ${row.totalPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right tabular-nums text-green-600 dark:text-green-400">
                            ${row.principal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right tabular-nums text-red-600 dark:text-red-400">
                            ${row.interest.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right tabular-nums font-medium">
                            ${row.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
