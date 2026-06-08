import React from 'react';
import { Car } from 'lucide-react';

const AutoLoanView: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-32 text-center">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <Car className="w-16 h-16 text-primary" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Crédito Automotriz</h2>
      <p className="text-muted-foreground max-w-md">
        Esta sección te permitirá simular y gestionar tus créditos vehiculares muy pronto.
      </p>
    </div>
  );
};

export default AutoLoanView;
