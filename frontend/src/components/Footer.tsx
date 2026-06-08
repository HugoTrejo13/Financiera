import React from 'react';
import { Wallet, Globe, MessageCircle, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 text-slate-300 py-16 px-4 border-t border-slate-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand & Mission */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary/20 p-1.5 rounded-lg">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Financiera</span>
          </div>
          <p className="text-slate-400 max-w-sm mb-6 leading-relaxed">
            Tu gestor financiero personal hecho para México. 
            Registra gastos, simula pagos a meses y mantén el control real de tu dinero sin complicaciones.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-white font-semibold mb-4 tracking-wide">Recursos</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-primary transition-colors">Simulador de Deudas</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Calculadora ISR <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-1">Pronto</span></a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Rendimientos Cetes <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-1">Pronto</span></a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Blog Financiero</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4 tracking-wide">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-primary transition-colors">Aviso de Privacidad</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Términos de Uso</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Seguridad</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
          </ul>
        </div>

      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} Financiera App. Todos los derechos reservados.</p>
        <div className="flex items-center gap-2">
          <span>Hecho con</span>
          <span className="text-red-500">❤️</span>
          <span>en México</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
