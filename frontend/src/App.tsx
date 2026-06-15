import React, { useState, useEffect } from 'react';
import DebtsView from './components/DebtsView';
import MortgageView from './components/MortgageView';
import AutoLoanView from './components/AutoLoanView';
import NewsSection from './components/NewsSection';
import Footer from './components/Footer';
import { Wallet, TrendingUp, ShieldCheck, MapPin, Moon, Sun, ChevronLeft } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('lobby'); // 'lobby', 'debts', 'mortgage', 'auto'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Estado para el modo oscuro (leemos de localStorage si existe)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Aplicar la clase .dark al HTML cuando cambie el estado
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Vista principal de la app (Herramientas Internas)
  if (currentView !== 'lobby') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Navbar Interno */}
        <header className="w-full bg-card border-b border-border h-16 flex items-center relative z-50 shadow-sm">
          <div className="w-full px-4 flex items-center gap-4">
            <button onClick={() => setCurrentView('lobby')} className="text-muted-foreground hover:bg-muted hover:text-foreground p-2 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 text-foreground font-semibold hover:text-primary transition-colors"
            >
              Herramientas
              <svg className={`fill-current h-4 w-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </button>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight opacity-50">
              <Wallet className="w-5 h-5 text-primary" />
              Financiera
            </div>
          </div>
          
          {/* Mega Menú (Dropdown Panel estilo Google) */}
          {isMenuOpen && (
            <div className="absolute top-16 left-0 w-full bg-card border-b border-border shadow-lg z-40 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="flex flex-col md:flex-row justify-center gap-8 px-4 py-8">
                
                {/* Columna 1 */}
                <div className="w-full md:w-80">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Finanzas Personales</h3>
                  <button 
                    onClick={() => { setCurrentView('debts'); setIsMenuOpen(false); }}
                    className={`block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${currentView === 'debts' ? 'bg-primary/5 border border-primary/20 text-primary font-medium' : 'text-foreground'}`}
                  >
                    Gestión de Gastos
                    <p className="text-xs text-muted-foreground mt-1 font-normal">Registra tus deudas y simula pagos a meses.</p>
                  </button>
                </div>

                {/* Columna 2 */}
                <div className="w-full md:w-80">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Créditos</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => { setCurrentView('mortgage'); setIsMenuOpen(false); }}
                      className={`block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${currentView === 'mortgage' ? 'bg-primary/5 border border-primary/20 text-primary font-medium' : 'text-foreground'}`}
                    >
                      Crédito Hipotecario
                      <p className="text-xs text-muted-foreground mt-1 font-normal">Proyecta la compra de tu casa.</p>
                    </button>
                    <button 
                      onClick={() => { setCurrentView('auto'); setIsMenuOpen(false); }}
                      className={`block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${currentView === 'auto' ? 'bg-primary/5 border border-primary/20 text-primary font-medium' : 'text-foreground'}`}
                    >
                      Crédito Automotriz
                      <p className="text-xs text-muted-foreground mt-1 font-normal">Calcula mensualidades de tu próximo auto.</p>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </header>

        {/* Overlay para cerrar el menú haciendo clic afuera */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 top-16 z-30 bg-background/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <main className="flex-1 overflow-auto">
          {currentView === 'debts' && <DebtsView onBack={() => setCurrentView('lobby')} />}
          {currentView === 'mortgage' && <MortgageView />}
          {currentView === 'auto' && <AutoLoanView />}
        </main>
      </div>
    );
  }

  // ── Pantalla de Lobby ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Navbar mínimo ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-base tracking-tight">Financiera</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Toggle Modo Oscuro */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setCurrentView('debts')}
              className="inline-flex items-center gap-2 rounded-full text-sm font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 h-9 px-5 shadow-md shadow-primary/20 cursor-pointer"
            >
              Comenzar
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center pt-20 pb-24 px-4 overflow-hidden">

        {/* Fondo decorativo con gradiente */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        {/* Ícono de marca */}
        <div className="mb-6 bg-primary/10 border border-primary/20 p-5 rounded-2xl shadow-lg shadow-primary/10">
          <Wallet className="w-12 h-12 text-primary" />
        </div>

        {/* Tagline en dos líneas estilo editorial */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-4">
          <span className="text-primary">Controla tus gastos,</span>
          <br />
          <span className="text-foreground">controla a tachi.</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-[560px] mb-8 leading-relaxed">
          Tu gestor financiero personal. Registra gastos, mantén el control real de tus finanzas.
        </p>

        {/* Chips de beneficios */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {[
            { icon: ShieldCheck, label: '100% Privado' },
            { icon: MapPin, label: 'Hecho para México' },
            { icon: TrendingUp, label: 'Control en tiempo real' },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border/60 bg-card/80 text-sm text-muted-foreground font-medium backdrop-blur-sm"
            >
              <Icon className="w-3.5 h-3.5 text-primary" />
              {label}
            </span>
          ))}
        </div>

        {/* CTA principal */}
        <button
          onClick={() => setCurrentView('debts')}
          className="inline-flex items-center justify-center gap-2 rounded-full text-lg font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 h-14 px-10 shadow-xl shadow-primary/25 cursor-pointer"
        >
          Comenzar ahora
        </button>

        {/* Indicador de scroll */}
        <div className="mt-16 flex flex-col items-center gap-1.5 text-muted-foreground/40 animate-bounce">
          <span className="text-xs uppercase tracking-widest">Noticias</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L1 3h10L6 8z" />
          </svg>
        </div>
      </section>

      {/* ── Sección de Noticias ───────────────────────────────────────────────── */}
      <NewsSection />

      {/* ── Footer Profesional ────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

export default App;
