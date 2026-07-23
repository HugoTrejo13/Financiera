import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string; // Formato "YYYY-MM"
  onMonthChange: (month: string) => void;
}

export default function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const isCurrentOrFuture = selectedMonth >= currentMonthStr;

  const formatMonthName = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleString('es-ES', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  const changeMonth = (offset: number) => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1 + offset, 1);
    const newMonthStr = date.toISOString().slice(0, 7);
    
    // Evitar navegar a meses futuros
    if (offset > 0 && newMonthStr > currentMonthStr) {
      return;
    }
    
    onMonthChange(newMonthStr);
  };

  return (
    <div className="inline-flex items-center gap-2 bg-card border border-border/80 rounded-2xl p-1.5 shadow-sm">
      <button
        type="button"
        onClick={() => changeMonth(-1)}
        className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        title="Mes anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-xl">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-extrabold tracking-tight text-foreground whitespace-nowrap">
          {formatMonthName(selectedMonth)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => changeMonth(1)}
        disabled={isCurrentOrFuture}
        className={`p-1.5 rounded-xl transition-colors ${
          isCurrentOrFuture
            ? 'opacity-30 cursor-not-allowed text-muted-foreground'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer'
        }`}
        title={isCurrentOrFuture ? 'Mes futuro bloqueado' : 'Mes siguiente'}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
