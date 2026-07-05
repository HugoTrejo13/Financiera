import React, { useState } from 'react';
import { Target, Users, Plus, PiggyBank, Briefcase, Plane, Home, Car, Coins } from 'lucide-react';
import { useInvestments, useSpaces } from '../hooks/useInvestments';
import type { InvestmentPlan } from '../hooks/useInvestments';

const ICONS: Record<string, React.ReactNode> = {
  PiggyBank: <PiggyBank className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
  Plane: <Plane className="w-6 h-6" />,
  Home: <Home className="w-6 h-6" />,
  Car: <Car className="w-6 h-6" />
};

export default function MetasView() {
  const { plans, loadingPlans, createPlan, contribute } = useInvestments();
  const { spaces, loadingSpaces, createSpace, inviteToSpace } = useSpaces();

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isSpaceModalOpen, setSpaceModalOpen] = useState(false);
  const [isContributeModalOpen, setContributeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);

  // Form states
  const [newPlan, setNewPlan] = useState({ name: '', target_amount: '', target_date: '', space_id: '', icon: 'PiggyBank', color: '#10b981' });
  const [newSpaceName, setNewSpaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedSpaceForInvite, setSelectedSpaceForInvite] = useState<number | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPlan.mutateAsync({
      ...newPlan,
      target_amount: parseFloat(newPlan.target_amount),
      space_id: newPlan.space_id ? parseInt(newPlan.space_id) : null
    });
    setCreateModalOpen(false);
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSpace.mutateAsync(newSpaceName);
    setNewSpaceName('');
    setSpaceModalOpen(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSpaceForInvite) {
      await inviteToSpace.mutateAsync({ spaceId: selectedSpaceForInvite, email: inviteEmail });
      setInviteEmail('');
      setSelectedSpaceForInvite(null);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan) {
      await contribute.mutateAsync({ planId: selectedPlan.id, amount: parseFloat(contributeAmount) });
      setContributeAmount('');
      setContributeModalOpen(false);
      setSelectedPlan(null);
    }
  };

  if (loadingPlans || loadingSpaces) {
    return <div className="p-8 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const personalPlans = plans.filter(p => !p.space_id);
  const spacePlans = plans.filter(p => p.space_id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas de Ahorro</h1>
          <p className="text-muted-foreground mt-1">Alcanza tus objetivos financieros, solo o en equipo.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSpaceModalOpen(true)}
            className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4" /> Nuevo Espacio
          </button>
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nueva Meta
          </button>
        </div>
      </div>

      {/* Espacios Compartidos Section */}
      {spaces.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Espacios Compartidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map(space => (
              <div key={space.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">{space.name}</h3>
                  <button onClick={() => setSelectedSpaceForInvite(space.id)} className="text-xs text-primary hover:underline font-medium">Invitar</button>
                </div>
                {/* Invite Form inline */}
                {selectedSpaceForInvite === space.id && (
                  <form onSubmit={handleInvite} className="mb-4 flex gap-2">
                    <input type="email" placeholder="Email del usuario" required className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                    <button type="submit" className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg">Enviar</button>
                  </form>
                )}
                
                <div className="space-y-3 mt-4 border-t border-border/50 pt-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Metas del grupo:</p>
                  {spacePlans.filter(p => p.space_id === space.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No hay metas en este espacio.</p>
                  ) : (
                    spacePlans.filter(p => p.space_id === space.id).map(plan => (
                      <PlanCard key={plan.id} plan={plan} onContribute={() => { setSelectedPlan(plan); setContributeModalOpen(true); }} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metas Personales Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-green-500" /> Metas Personales</h2>
        {personalPlans.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <Target className="w-12 h-12 mb-4 opacity-50" />
            <p>No tienes metas personales activas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} onContribute={() => { setSelectedPlan(plan); setContributeModalOpen(true); }} />
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* Create Plan Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-xl border border-border p-6 animate-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-4">Nueva Meta</h2>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre de la meta</label>
                <input type="text" required className="w-full mt-1 p-3 rounded-xl border border-border bg-background" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} placeholder="Ej. Enganche Casa" />
              </div>
              <div>
                <label className="text-sm font-medium">Monto Objetivo ($)</label>
                <input type="number" required min="1" className="w-full mt-1 p-3 rounded-xl border border-border bg-background" value={newPlan.target_amount} onChange={e => setNewPlan({...newPlan, target_amount: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Fecha Objetivo (Opcional)</label>
                <input type="date" className="w-full mt-1 p-3 rounded-xl border border-border bg-background" value={newPlan.target_date} onChange={e => setNewPlan({...newPlan, target_date: e.target.value})} />
              </div>
              {spaces.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Vincular a Espacio (Opcional)</label>
                  <select className="w-full mt-1 p-3 rounded-xl border border-border bg-background" value={newPlan.space_id} onChange={e => setNewPlan({...newPlan, space_id: e.target.value})}>
                    <option value="">Personal (No compartir)</option>
                    {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl shadow-sm">Guardar Meta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Space Modal */}
      {isSpaceModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-3xl shadow-xl border border-border p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4">Crear Espacio Compartido</h2>
            <form onSubmit={handleCreateSpace} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre del Grupo</label>
                <input type="text" required className="w-full mt-1 p-3 rounded-xl border border-border bg-background" value={newSpaceName} onChange={e => setNewSpaceName(e.target.value)} placeholder="Ej. Pareja, Viaje Amigos" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setSpaceModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl shadow-sm">Crear Espacio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {isContributeModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-3xl shadow-xl border border-border p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Coins className="w-5 h-5 text-yellow-500" /> Aportar a {selectedPlan.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">Ingresa el monto que deseas sumar (o usa un número negativo para retirar).</p>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Monto ($)</label>
                <input type="number" required step="0.01" className="w-full mt-1 p-3 rounded-xl border border-border bg-background text-lg font-bold" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} placeholder="$0.00" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setContributeModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl shadow-sm">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, onContribute }: { plan: InvestmentPlan; onContribute: () => void }) {
  const percentage = Math.min((plan.current_amount / plan.target_amount) * 100, 100);
  const Icon = ICONS[plan.icon] || <PiggyBank className="w-5 h-5" />;

  return (
    <div className="bg-background border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${plan.color}20`, color: plan.color }}>
          {Icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-foreground">{plan.name}</h4>
          <p className="text-xs text-muted-foreground">Objetivo: ${plan.target_amount.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm font-medium">
          <span>${plan.current_amount.toLocaleString()}</span>
          <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${percentage}%`, backgroundColor: plan.color }}
          />
        </div>
      </div>

      <button 
        onClick={onContribute}
        className="w-full py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-bold transition-colors"
      >
        Aportar a Meta
      </button>
    </div>
  );
}
