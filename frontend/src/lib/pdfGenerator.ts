import jsPDF from 'jspdf';

interface AutoLoanData {
  bankName: string;
  carValue: number;
  downPayment: number;
  downPaymentPercent: number;
  loanAmount: number;
  monthlyLoanPayment: number;
  monthlyInsurance: number;
  totalMonthlyPayment: number;
  totalMonths: number;
  actualMonths: number;
  totalInterest: number;
  totalInsurance: number;
  totalPrincipal: number;
  totalCost: number;
  extraPayments: number;
  interestRate: string;
  schedule: Array<{
    month: number;
    loanPayment: number;
    insurance: number;
    totalPayment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

interface MortgageData {
  bankName: string;
  propertyValue: number;
  downPayment: number;
  downPaymentPercent: number;
  loanAmount: number;
  monthlyPayment: number;
  monthlyPaymentWithExtra: number;
  totalMonths: number;
  actualMonths: number;
  totalInterest: number;
  totalPrincipal: number;
  totalCost: number;
  extraPayments: number;
  interestRate: string;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export function generateAutoLoanPDF(data: AutoLoanData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header with warning
  doc.setFillColor(255, 243, 205);
  doc.rect(10, 10, pageWidth - 20, 35, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SIMULACIÓN DE CRÉDITO AUTOMOTRIZ', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('⚠️ IMPORTANTE: Este es un resumen de ejemplo', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Esta simulación NO representa una tabla de amortización con datos reales', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 5;
  doc.text('Consulte con su institución financiera para obtener información oficial', pageWidth / 2, yPosition, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPosition += 15;

  // Bank name
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Institución: ${data.bankName}`, 15, yPosition);
  yPosition += 10;

  // Summary section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen del Crédito', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['Valor del Vehículo:', `$${data.carValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
    ['Enganche:', `$${data.downPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (${data.downPaymentPercent.toFixed(1)}%)`],
    ['Monto del Crédito:', `$${data.loanAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
    ['Tasa de Interés Anual:', `${data.interestRate}%`],
    ['Plazo:', `${data.totalMonths} meses (${(data.totalMonths / 12).toFixed(0)} años)`],
    ['Pago Mensual del Crédito:', `$${data.monthlyLoanPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
    ['Seguro Mensual:', `$${data.monthlyInsurance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
    ['Pago Mensual Total:', `$${data.totalMonthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
  ];

  if (data.extraPayments > 0) {
    summaryData.push(['Aportaciones Extras:', `$${data.extraPayments.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`]);
    summaryData.push(['Plazo Real:', `${data.actualMonths} meses (${(data.actualMonths / 12).toFixed(1)} años)`]);
  }

  summaryData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 100, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Totals section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Totales', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const totalsData = [
    ['Total de Intereses:', `$${data.totalInterest.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
    ['Total de Seguros:', `$${data.totalInsurance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
    ['Costo Total:', `$${data.totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
  ];

  totalsData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 100, yPosition);
    yPosition += 6;
  });

  // Add new page for amortization table
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Tabla de Amortización Completa', 15, yPosition);
  yPosition += 10;

  // Table headers
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const headers = ['Mes', 'Pago Crédito', 'Seguro', 'Total', 'Capital', 'Interés', 'Saldo'];
  const colWidths = [15, 30, 25, 30, 28, 28, 32];
  let xPosition = 15;

  const drawTableHeaders = () => {
    xPosition = 15;
    headers.forEach((header, i) => {
      doc.text(header, xPosition, yPosition);
      xPosition += colWidths[i];
    });
    yPosition += 5;
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 5;
  };

  drawTableHeaders();

  // Table rows (all months)
  doc.setFont('helvetica', 'normal');
  
  for (let i = 0; i < data.schedule.length; i++) {
    const row = data.schedule[i];
    xPosition = 15;

    const rowData = [
      row.month.toString(),
      `$${row.loanPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      `$${row.insurance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      `$${row.totalPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      `$${row.principal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      `$${row.interest.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      `$${row.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    ];

    rowData.forEach((cell, j) => {
      doc.text(cell, xPosition, yPosition, { maxWidth: colWidths[j] - 2 });
      xPosition += colWidths[j];
    });

    yPosition += 5;

    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      drawTableHeaders();
      doc.setFont('helvetica', 'normal');
    }
  }

  // Footer
  const currentDate = new Date().toLocaleDateString('es-MX');
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generado el ${currentDate} - Documento de simulación sin validez oficial`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save PDF
  doc.save(`simulacion-credito-automotriz-${data.bankName.replace(/\s+/g, '-')}.pdf`);
}

export function generateMortgagePDF(data: MortgageData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header with warning
  doc.setFillColor(255, 243, 205);
  doc.rect(10, 10, pageWidth - 20, 35, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SIMULACIÓN DE CRÉDITO HIPOTECARIO', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('⚠️ IMPORTANTE: Este es un resumen de ejemplo', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Esta simulación NO representa una tabla de amortización con datos reales', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 5;
  doc.text('Consulte con su institución financiera para obtener información oficial', pageWidth / 2, yPosition, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPosition += 15;

  // Bank name
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Institución: ${data.bankName}`, 15, yPosition);
  yPosition += 10;

  // Summary section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen del Crédito', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['Valor del Inmueble:', `$${data.propertyValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
    ['Enganche:', `$${data.downPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (${data.downPaymentPercent.toFixed(1)}%)`],
    ['Monto del Crédito:', `$${data.loanAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
    ['Tasa de Interés Anual:', `${data.interestRate}%`],
    ['Plazo:', `${data.totalMonths} meses (${(data.totalMonths / 12).toFixed(0)} años)`],
    ['Pago Mensual:', `$${data.monthlyPaymentWithExtra.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
  ];

  if (data.extraPayments > 0) {
    summaryData.push(['Aportaciones Extras:', `$${data.extraPayments.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`]);
    summaryData.push(['Plazo Real:', `${data.actualMonths} meses (${(data.actualMonths / 12).toFixed(1)} años)`]);
  }

  summaryData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 100, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Totals section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Totales', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const totalsData = [
    ['Total de Intereses:', `$${data.totalInterest.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
    ['Costo Total:', `$${data.totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
  ];

  totalsData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 100, yPosition);
    yPosition += 6;
  });

  // Add new page for amortization table
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Tabla de Amortización Completa', 15, yPosition);
  yPosition += 10;

  // Table headers
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const headers = ['Mes', 'Pago', 'Capital', 'Interés', 'Saldo'];
  const colWidths = [20, 40, 40, 40, 48];
  let xPosition = 15;

  const drawTableHeaders = () => {
    xPosition = 15;
    headers.forEach((header, i) => {
      doc.text(header, xPosition, yPosition);
      xPosition += colWidths[i];
    });
    yPosition += 5;
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 5;
  };

  drawTableHeaders();

  // Table rows (all months)
  doc.setFont('helvetica', 'normal');
  
  for (let i = 0; i < data.schedule.length; i++) {
    const row = data.schedule[i];
    xPosition = 15;

    const rowData = [
      row.month.toString(),
      `$${row.payment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      `$${row.principal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      `$${row.interest.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      `$${row.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    ];

    rowData.forEach((cell, j) => {
      doc.text(cell, xPosition, yPosition, { maxWidth: colWidths[j] - 2 });
      xPosition += colWidths[j];
    });

    yPosition += 5;

    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      drawTableHeaders();
      doc.setFont('helvetica', 'normal');
    }
  }

  // Footer
  const currentDate = new Date().toLocaleDateString('es-MX');
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generado el ${currentDate} - Documento de simulación sin validez oficial`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save PDF
  doc.save(`simulacion-credito-hipotecario-${data.bankName.replace(/\s+/g, '-')}.pdf`);
}

