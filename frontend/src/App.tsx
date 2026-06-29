import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import NewsSection from './components/NewsSection';
import Footer from './components/Footer';
import { Wallet, TrendingUp, ShieldCheck, MapPin, Moon, Sun, ChevronLeft, Bell } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { useBudgetAlerts } from './hooks/useBudgets';
import LoginModal from './components/auth/LoginModal';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isDarkMode, setIsDarkMode } = useAppStore();
  const { isAuthenticated, logout } = useAuthStore();
  
  // Obtener mes actual para alertas
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { alerts } = useBudgetAlerts(currentMonth);

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

  const isLobby = location.pathname === '/';

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const renderInternalHeader = () => (
    <>
      <header className="w-full bg-card border-b border-border h-16 flex items-center relative z-50 shadow-sm">
        <div className="w-full px-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:bg-muted hover:text-foreground p-2 rounded-full transition-colors"
            data-tour="back-button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 text-foreground font-semibold hover:text-primary transition-colors"
            data-tour="tools-menu"
          >
            Herramientas
            <svg className={`fill-current h-4 w-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </button>
          
          <div className="flex-1" />
          
          {/* Campanita de notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-muted transition-colors"
              title="Alertas de presupuesto"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              )}
            </button>
            
            {/* Panel de notificaciones */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Alertas de Presupuesto
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <p className="text-sm">No hay alertas activas</p>
                      <p className="text-xs mt-1">Tus presupuestos están bajo control ✓</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="p-3 mb-2 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            navigate('/presupuesto');
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">{alert.category?.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{alert.category?.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {alert.is_over_budget ? (
                                  <span className="text-destructive font-semibold">
                                    ⚠️ Presupuesto excedido
                                  </span>
                                ) : (
                                  <span className="text-yellow-600 font-semibold">
                                    ⚠️ {alert.percentage_used.toFixed(0)}% del presupuesto usado
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                ${alert.spent_amount.toFixed(2)} de ${alert.budget_amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {alerts.length > 0 && (
                  <div className="p-3 border-t border-border">
                    <button
                      onClick={() => {
                        navigate('/presupuesto');
                        setShowNotifications(false);
                      }}
                      className="w-full text-sm text-primary hover:underline"
                    >
                      Ver todos los presupuestos →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors ml-4"
            >
              Cerrar sesión
            </button>
          )}

          <div className="flex items-center gap-2 font-bold text-lg tracking-tight opacity-50 ml-4">
            <Wallet className="w-5 h-5 text-primary" />
            Financiera
          </div>
        </div>
        
        {/* Overlay para cerrar notificaciones */}
        {showNotifications && (
          <div
            className="fixed inset-0 top-16 z-30"
            onClick={() => setShowNotifications(false)}
          />
        )}
        
        {/* Mega Menú (Dropdown Panel estilo Google) */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-card border-b border-border shadow-lg z-40 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex flex-col md:flex-row justify-center gap-8 px-4 py-8">
              
              {/* Columna 1 */}
              <div className="w-full md:w-80">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Finanzas Personales</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}
                    className={`block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${location.pathname === '/dashboard' ? 'bg-primary/5 border border-primary/20 text-primary font-medium' : 'text-foreground'}`}
                  >
                    Resumen y Analíticas
                    <p className="text-xs text-muted-foreground mt-1 font-normal">Vista general de tu salud financiera.</p>
                  </button>
                  <button
                    onClick={() => { navigate('/gastos'); setIsMenuOpen(false); }}
                    className={`block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${location.pathname === '/gastos' ? 'bg-primary/5 border border-primary/20 text-primary font-medium' : 'text-foreground'}`}
                  >
                    Gestión de Gastos
                    <p className="text-xs text-muted-foreground mt-1 font-normal">Registra tus deudas y simula pagos a meses.</p>
                  </button>
                  <button
                    onClick={() => { navigate('/presupuesto'); setIsMenuOpen(false); }}
                    className={`block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${location.pathname === '/presupuesto' ? 'bg-primary/5 border border-primary/20 text-primary font-medium' : 'text-foreground'}`}
                  >
                    Presupuesto Mensual
                    <p className="text-xs text-muted-foreground mt-1 font-normal">Controla tus gastos por categoría y recibe alertas.</p>
                  </button>
                </div>
              </div>

              {/* Columna 2 */}
              <div className="w-full md:w-80">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Créditos</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => { navigate('/hipoteca'); setIsMenuOpen(false); }}
                    className={`block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${location.pathname === '/hipoteca' ? 'bg-primary/5 border border-primary/20 text-primary font-medium' : 'text-foreground'}`}
                  >
                    Crédito Hipotecario
                    <p className="text-xs text-muted-foreground mt-1 font-normal">Proyecta la compra de tu casa.</p>
                  </button>
                  <button 
                    onClick={() => { navigate('/auto'); setIsMenuOpen(false); }}
                    className={`block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${location.pathname === '/auto' ? 'bg-primary/5 border border-primary/20 text-primary font-medium' : 'text-foreground'}`}
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
    </>
  );

  if (!isLobby) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {renderInternalHeader()}
        <main className="flex-1 overflow-auto">
          <Outlet />
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
              data-tour="dark-mode-toggle"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-full text-sm font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 h-9 px-5 shadow-md shadow-primary/20 cursor-pointer"
              data-tour="start-button"
            >
              {isAuthenticated ? 'Ir a Gastos' : 'Comenzar'}
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
          <span className="text-primary">controla tu vida</span>
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
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleStart}
            className="inline-flex items-center justify-center gap-2 rounded-full text-lg font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 h-14 px-10 shadow-xl shadow-primary/25 cursor-pointer"
            data-tour="start-button-hero"
          >
            {isAuthenticated ? 'Ir a mi panel' : 'Comenzar ahora'}
          </button>
        </div>

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
      
      {/* ── Modal de Autenticación ────────────────────────────────────────────── */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
}

export default App;
