import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import NewsSection from './components/NewsSection';
import Footer from './components/Footer';
import { Wallet, TrendingUp, ShieldCheck, MapPin, Moon, Sun, ChevronLeft, Bell } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import LoginModal from './components/auth/LoginModal';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { isDarkMode, setIsDarkMode, notifications, markAsRead, markAllAsRead } = useAppStore();
  const { isAuthenticated, logout } = useAuthStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;

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
        <div className="w-full px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:bg-muted hover:text-foreground p-2 rounded-full transition-colors"
              data-tour="back-button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 mr-4">
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
              <button 
                onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}
                className={`font-bold text-sm transition-colors ${location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Perfil
              </button>
              <button 
                onClick={() => { navigate('/gastos'); setIsMenuOpen(false); }}
                className={`font-bold text-sm transition-colors ${location.pathname === '/gastos' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Gestión de Compras
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="text-muted-foreground hover:text-foreground transition-colors relative" 
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-card"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-card border border-border shadow-xl rounded-xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-sm">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                        Marcar todas leídas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        No tienes notificaciones
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                          onClick={() => {
                            markAsRead(notif.id);
                            setIsNotificationsOpen(false);
                            if (notif.path) navigate(notif.path);
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${!notif.read ? 'font-bold text-primary' : 'font-medium'}`}>{notif.title}</h4>
                            {!notif.read && <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {isAuthenticated && (
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors ml-2"
              >
                Cerrar sesión
              </button>
            )}

            <div className="flex items-center gap-2 font-bold text-lg tracking-tight opacity-50 border-l border-border pl-4">
              <Wallet className="w-5 h-5 text-primary" />
              Financiera
            </div>
          </div>
      </div>
        

        
        {/* Mega Menú (Dropdown Panel estilo Google) */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-card border-b border-border shadow-lg z-40 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex flex-col md:flex-row justify-center gap-8 px-4 py-8">
              
              {/* Columna de Créditos */}
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

  const renderModals = () => (
    <>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
      {isLogoutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsLogoutModalOpen(false)}></div>
          <div className="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2">¿Seguro que quieres salir?</h3>
            <p className="text-muted-foreground text-sm mb-6">Tendrás que volver a iniciar sesión para acceder a tu información.</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  logout();
                  setIsLogoutModalOpen(false);
                  navigate('/');
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (!isLobby) {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col overflow-hidden">
          {renderInternalHeader()}
          <div className="flex-1 flex overflow-hidden w-full">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background/50">
              <Outlet />
            </main>
          </div>
        </div>
        {renderModals()}
      </>
    );
  }

  // ── Pantalla de Lobby ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
      {/* ── Navbar Institucional (Estilo JCF) ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-md shadow-primary/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight leading-none text-foreground">Financiera</span>
              <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Control Inteligente</span>
            </div>
          </div>
          
          {/* Menú Central */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#" className="text-foreground hover:text-primary transition-colors border-b-2 border-primary py-5">Inicio</a>
            <a href="#noticias" className="hover:text-primary transition-colors py-5 border-b-2 border-transparent hover:border-primary/50">Noticias</a>
            <a href="#recursos" className="hover:text-primary transition-colors py-5 border-b-2 border-transparent hover:border-primary/50">Recursos</a>
            <a href="#legal" className="hover:text-primary transition-colors py-5 border-b-2 border-transparent hover:border-primary/50">Ayuda</a>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-full text-sm font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {isAuthenticated ? 'MI PANEL' : 'INICIA SESIÓN'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Banner Principal (Hero) ───────────────────────────────────────────── */}
      <section className="w-full flex-1 flex flex-col md:flex-row items-center justify-between px-6 py-16 md:py-24 max-w-7xl mx-auto gap-12 md:gap-16">
        {/* Texto del Banner */}
        <div className="flex-1 text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-xs font-bold tracking-widest uppercase border border-border/50">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Software Financiero Seguro
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground leading-[1.05]">
            EL CONTROL TOTAL <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">DE TU DINERO.</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium">
            La plataforma minimalista que te permite registrar tus compras diarias y simular créditos a meses sin intereses para lograr tu libertad económica.
          </p>
          
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl text-base font-bold transition-all bg-foreground text-background hover:scale-105 h-14 px-8 shadow-xl"
            >
              Comenzar a ahorrar
            </button>
            <a href="#noticias" className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl text-base font-bold transition-all border-2 border-border bg-background hover:bg-muted text-foreground h-14 px-8">
              Conoce más
            </a>
          </div>
        </div>

        {/* Ilustración del Banner - Limpia y sin amontonar */}
        <div className="flex-1 w-full max-w-md mx-auto md:max-w-none relative">
          <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-3xl opacity-50" />
          
          <div className="relative flex flex-col gap-6">
            <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-[2rem] shadow-2xl p-8 transition-transform hover:-translate-y-2 duration-500">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-tight">Simulador Financiero</h3>
              <p className="text-muted-foreground leading-relaxed">Proyecta tus compras a meses sin intereses y decide inteligentemente.</p>
            </div>

            <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-3xl shadow-xl p-6 flex items-center gap-5 transition-transform hover:-translate-y-1 duration-500 delay-100">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <Wallet className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Ahorro Mensual Promedio</p>
                <p className="text-2xl font-black tracking-tight text-foreground">+$4,500.00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Franja Divisoria ──────────────────────────────────────────────────── */}
      <div className="w-full bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <MapPin className="w-8 h-8 opacity-80" />
            <div>
              <h4 className="font-bold text-lg">Desarrollado para México</h4>
              <p className="text-primary-foreground/80 text-sm font-medium">Adaptado a la economía y créditos nacionales.</p>
            </div>
          </div>
          <div className="h-12 w-px bg-primary-foreground/20 hidden md:block" />
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 opacity-80" />
            <div>
              <h4 className="font-bold text-lg">Privacidad Absoluta</h4>
              <p className="text-primary-foreground/80 text-sm font-medium">Tus datos nunca son compartidos con terceros.</p>
            </div>
          </div>
        </div>
      </div>

      <div id="noticias" className="w-full bg-background pt-16 pb-16">
        <NewsSection />
      </div>
      {/* ── Footer Profesional ────────────────────────────────────────────────── */}
      <Footer />
      
      {/* ── Modales ────────────────────────────────────────────── */}
      {renderModals()}
    </div>
  );
}

export default App;
