import React from 'react';
import { Home } from 'lucide-react';

const MortgageView: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-32 text-center">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <Home className="w-16 h-16 text-primary" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Crédito Hipotecario</h2>
      <p className="text-muted-foreground max-w-md">
        Esta sección te permitirá simular y gestionar tus créditos hipotecarios muy pronto.
      </p>
    </div>
  );
};

export default MortgageView;
