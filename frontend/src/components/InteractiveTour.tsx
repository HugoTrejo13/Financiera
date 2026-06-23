import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TourStep {
  target: string; // CSS selector or data-tour-id
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void; // Optional action to perform before showing step
}

interface InteractiveTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const InteractiveTour: React.FC<InteractiveTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      target: '[data-tour="start-button"]',
      title: 'Botón Comenzar',
      description: 'Haz clic aquí para acceder a todas las herramientas financieras.',
      position: 'bottom'
    },
    {
      target: '[data-tour="dark-mode-toggle"]',
      title: 'Modo Oscuro',
      description: 'Cambia entre modo claro y oscuro según tu preferencia.',
      position: 'bottom'
    },
    {
      target: '[data-tour="tools-menu"]',
      title: 'Menú de Herramientas',
      description: 'Navega entre Gestión de Gastos, Crédito Hipotecario y Crédito Automotriz.',
      position: 'bottom',
      action: () => {
        // Simulate entering the app
        const startButton = document.querySelector('[data-tour="start-button"]') as HTMLButtonElement;
        if (startButton) startButton.click();
      }
    },
    {
      target: '[data-tour="add-expense"]',
      title: 'Agregar Gasto',
      description: 'Registra tus compras seleccionando categoría, monto y meses sin intereses.',
      position: 'right'
    },
    {
      target: '[data-tour="expense-chart"]',
      title: 'Gráfica de Gastos',
      description: 'Visualiza tus gastos por categoría con gráficas interactivas.',
      position: 'top'
    }
  ];

  const currentStepData = steps[currentStep];

  // Calculate positions for highlight and tooltip
  useEffect(() => {
    const updatePositions = () => {
      const targetElement = document.querySelector(currentStepData.target);
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Set highlight position
      setHighlightPosition({
        top: rect.top + scrollY,
        left: rect.left + scrollX,
        width: rect.width,
        height: rect.height
      });

      // Calculate tooltip position based on preferred position
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const padding = 20;

      let top: number;
      let left: number;

      switch (currentStepData.position) {
        case 'bottom':
          top = rect.bottom + scrollY + padding;
          left = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'top':
          top = rect.top + scrollY - tooltipHeight - padding;
          left = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'right':
          top = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.right + scrollX + padding;
          break;
        case 'left':
          top = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.left + scrollX - tooltipWidth - padding;
          break;
        default:
          top = rect.bottom + scrollY + padding;
          left = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2);
      }

      // Keep tooltip within viewport
      const maxLeft = window.innerWidth - tooltipWidth - 20;
      const maxTop = window.innerHeight + scrollY - tooltipHeight - 20;
      left = Math.max(20, Math.min(left, maxLeft));
      top = Math.max(scrollY + 20, Math.min(top, maxTop));

      setTooltipPosition({ top, left });

      // Scroll element into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Execute action if defined
    if (currentStepData.action) {
      currentStepData.action();
      // Wait for DOM update
      setTimeout(updatePositions, 300);
    } else {
      updatePositions();
    }

    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
    };
  }, [currentStep, currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] bg-background/80 backdrop-blur-sm" />

      {/* Highlight Box */}
      <div
        className="fixed z-[9999] pointer-events-none transition-all duration-300 ease-out"
        style={{
          top: `${highlightPosition.top}px`,
          left: `${highlightPosition.left}px`,
          width: `${highlightPosition.width}px`,
          height: `${highlightPosition.height}px`,
          boxShadow: '0 0 0 4px rgba(var(--primary-rgb, 59, 130, 246), 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
          borderRadius: '8px'
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] w-80 bg-card border-2 border-primary rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`
        }}
      >
        {/* Close Button */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors z-10"
          aria-label="Cerrar tour"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Step Counter */}
          <div className="mb-3">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">
              Paso {currentStep + 1} de {steps.length}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground mb-2">
            {currentStepData.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-6 bg-primary' 
                    : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                currentStep === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Skip Link */}
          {currentStep < steps.length - 1 && (
            <div className="text-center mt-3">
              <button
                onClick={onSkip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Saltar tutorial
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InteractiveTour;

// Made with Bob
