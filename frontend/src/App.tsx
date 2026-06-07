import React, { useState } from 'react';
import DebtsView from './components/DebtsView';
import { Wallet } from 'lucide-react';

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [lang, setLang] = useState<'es' | 'en'>('es');

  // Textos del Lobby según el idioma
  const texts = {
    es: {
      title: "Financiera",
      subtitle: "Tu gestor financiero personal",
      start: "Comenzar",
    },
    en: {
      title: "Financiera",
      subtitle: "Your personal finance manager",
      start: "Get started",
    }
  };

  // Pantalla de Lobby (Antes de entrar a la app)
  if (!isStarted) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground overflow-hidden">
        
        {/* Selector de idioma en la esquina superior derecha */}
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-card border border-border rounded-full p-1 shadow-sm z-50">
          <button 
            onClick={() => setLang('en')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            {/* INSTRUCCIÓN PARA EL USUARIO:
                Reemplaza el <span> por tu imagen así:
                <img src="/usa-flag.png" alt="USA Flag" className="w-5 h-5 rounded-full object-cover" />
            */}
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] overflow-hidden">🇺🇸</span>
            EN
          </button>
          
          <button 
            onClick={() => setLang('es')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${lang === 'es' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            {/* INSTRUCCIÓN PARA EL USUARIO:
                Reemplaza el <span> por tu imagen así:
                <img src="/mx-flag.png" alt="MX Flag" className="w-5 h-5 rounded-full object-cover" />
            */}
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] overflow-hidden">🇲🇽</span>
            ES
          </button>
        </div>

        {/* Contenido Principal del Lobby */}
        <div className="flex flex-col items-center text-center space-y-6 z-10 p-4">
          <div className="bg-primary/10 p-5 rounded-full mb-2">
            <Wallet className="w-16 h-16 text-primary" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            {texts[lang].title}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-[600px]">
            {texts[lang].subtitle}
          </p>
          
          <button 
            onClick={() => setIsStarted(true)}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full text-lg font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 h-14 px-8 shadow-lg shadow-primary/25 cursor-pointer"
          >
            {texts[lang].start}
          </button>
        </div>
        
        {/* Decoración de fondo simple */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      </div>
    );
  }

  // Vista de la Aplicación principal
  return (
    <div className="min-h-screen bg-slate-900">
      <DebtsView lang={lang} onBack={() => setIsStarted(false)} />
    </div>
  );
}

export default App;
