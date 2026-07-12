import { useCategorySpendingReport } from '../hooks/useCategories';
import { useDebts } from '../hooks/useDebts';
import ExpenseDonutChart from '../components/analytics/ExpenseDonutChart';

import { Wallet, TrendingDown, UserCircle, Calendar, ShieldCheck, Camera, X, Edit, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { report, loading: reportLoading } = useCategorySpendingReport(currentMonth);
  const { debts, loading: debtsLoading } = useDebts();
  const token = useAuthStore(state => state.token);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [profile, setProfile] = useState<{ email: string; alias: string | null; photo_url: string | null }>({
    email: 'usuario@ejemplo.com',
    alias: null,
    photo_url: null
  });

  const [tempAlias, setTempAlias] = useState('');
  const [tempCurrentPass, setTempCurrentPass] = useState('');
  const [tempNewPass, setTempNewPass] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token) {
      api.get('/auth/me').then(res => {
        setProfile({
          email: res.data.email,
          alias: res.data.alias,
          photo_url: res.data.photo_url
        });
        setTempAlias(res.data.alias || res.data.email.split('@')[0]);
      }).catch(console.error);
    }
  }, [token]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const res = await api.put('/auth/me/profile', { photo_url: base64 });
          setProfile(prev => ({ ...prev, photo_url: res.data.photo_url }));
        } catch (err) {
          console.error("Error updating photo", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    
    try {
      if (tempAlias !== profile.alias) {
        const res = await api.put('/auth/me/profile', { alias: tempAlias });
        setProfile(prev => ({ ...prev, alias: res.data.alias }));
      }
      
      if (tempCurrentPass && tempNewPass) {
        await api.put('/auth/me/password', { current_password: tempCurrentPass, new_password: tempNewPass });
      }

      setModalSuccess('Perfil actualizado correctamente.');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setTempCurrentPass('');
        setTempNewPass('');
        setModalSuccess('');
      }, 1500);
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Error al actualizar.');
    }
  };

  const displayAlias = profile.alias || profile.email.split('@')[0];

  if (reportLoading || debtsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalSpent = report.reduce((acc, item) => acc + item.total_spent, 0);
  const activeDebtsTotal = debts.reduce((acc, debt) => acc + debt.remaining_amount, 0);

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sección de Perfil de Usuario Principal */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-8 transition-all hover:shadow-md mb-8">
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-32 h-32 md:w-40 md:h-40 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 relative group cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all"
        >
          {profile.photo_url ? (
            <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <UserCircle className="w-24 h-24 md:w-28 md:h-28 text-primary transition-transform group-hover:scale-110" />
          )}
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-8 h-8 text-white mb-1" />
            <span className="text-white text-xs font-bold">Cambiar Foto</span>
          </div>
          <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h2 className="text-3xl font-bold capitalize">{displayAlias}</h2>
            <p className="text-lg text-muted-foreground">{profile.email}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold px-4 py-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-xl flex items-center gap-2 transition-colors"
            >
              <Edit className="w-4 h-4" /> Editar
            </button>
          </div>

          <div className="inline-block mt-2 px-4 py-1.5 bg-green-500/10 text-green-500 rounded-full text-sm font-bold uppercase tracking-wider">
            Ahorrador Activo
          </div>
        </div>
        
        <div className="hidden md:flex flex-col gap-4 border-l border-border/50 pl-8">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Tu Actividad</h3>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl"><Calendar className="w-5 h-5 text-blue-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Miembro desde</p>
              <p className="text-base font-semibold">2026</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl"><ShieldCheck className="w-5 h-5 text-purple-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Estado de Cuenta</p>
              <p className="text-base font-semibold text-green-500">Verificado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tu Resumen Financiero</h1>
          <p className="text-muted-foreground mt-1">Un vistazo claro a tu dinero este mes.</p>
        </div>
        <button 
          onClick={() => navigate('/gastos')}
          className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Añadir nueva compra
        </button>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Compras este mes</h3>
          </div>
          <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
        </div>


        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <TrendingDown className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Deuda Activa (Abonos)</h3>
          </div>
          <p className="text-3xl font-bold">${activeDebtsTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Distribución de Compras</h3>
          <ExpenseDonutChart data={report} />
        </div>
      </div>

      {/* Modal de Edición de Perfil */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-card border border-border/50 shadow-2xl rounded-3xl p-8 animate-in zoom-in-95 fade-in duration-200">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                Editar Perfil
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Actualiza tu alias o mantén tu cuenta segura cambiando tu contraseña.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alias</label>
                <input type="text" value={tempAlias} onChange={e => setTempAlias(e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ej. Alex Financiero" />
              </div>
              
              <div className="pt-2 pb-2">
                <hr className="border-border" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contraseña Actual (Opcional)</label>
                <input type="password" value={tempCurrentPass} onChange={e => setTempCurrentPass(e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Requerida solo para cambiar clave" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nueva Contraseña (Opcional)</label>
                <input type="password" value={tempNewPass} onChange={e => setTempNewPass(e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" />
              </div>
              
              {modalError && <p className="text-sm text-destructive font-medium">{modalError}</p>}
              {modalSuccess && <p className="text-sm text-green-500 font-medium">{modalSuccess}</p>}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
