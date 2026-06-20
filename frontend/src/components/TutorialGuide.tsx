import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Wallet, PieChart, Calculator, CreditCard, Sparkles } from 'lucide-react';

interface TutorialGuideProps {
  onClose: () => void;
}

const TutorialGuide: React.FC<TutorialGuideProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Wallet,
      title: "Bienvenido a Financiera",
      description: "Tu gestor financiero personal. Aquí podrás controlar tus gastos, simular créditos y tomar mejores decisiones financieras.",
      highlight: "Comencemos con un recorrido rápido de 5 pasos."
    },
    {
      icon: PieChart,
      title: "Gestión de Gastos",
      description: "Registra tus compras y deudas. Elige una categoría, agrega el monto y selecciona si pagarás a meses sin intereses.",
      highlight: "Visualiza tus gastos con gráficas por categoría."
    },
    {
      icon: Calculator,
      title: "Calculadora Hipotecaria",
      description: "Simula tu crédito de casa. Ingresa el valor del inmueble, enganche, tasa de interés y plazo.",
      highlight: "Ve mes a mes cómo se amortiza tu crédito."
    },
    {
      icon: CreditCard,
      title: "Calculadora Automotriz",
      description: "Proyecta tu crédito de auto. Incluye seguros mensuales y calcula el costo total de propiedad.",
      highlight: "Simula pagos extras para ahorrar en intereses."
    },
    {
      icon: Sparkles,
      title: "¡Listo para comenzar!",
      description: "Usa el menú 'Herramientas' para navegar entre secciones. Cambia entre modo claro y oscuro desde el ícono superior.",
      highlight: "Tus datos se guardan automáticamente."
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Cerrar tutorial"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 pt-12">
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl">
              <Icon className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Step Counter */}
          <div className="text-center mb-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Paso {currentStep + 1} de {steps.length}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-4 text-foreground">
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className="text-center text-muted-foreground mb-3 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Highlight */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-8">
            <p className="text-sm text-center text-primary font-medium">
              💡 {currentStepData.highlight}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Ir al paso ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
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
              className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Comenzar
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Skip Tutorial */}
          {currentStep < steps.length - 1 && (
            <div className="text-center mt-4">
              <button
                onClick={onClose}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Saltar tutorial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialGuide;

// Made with Bob
