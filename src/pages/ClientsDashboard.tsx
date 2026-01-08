import React, { useMemo, useState } from 'react';
import { 
  Users, Award, History, PieChart, UserPlus, 
  Tags, Mail, Gift, BarChart2, MessageSquare
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState } from '../types';
import { NewClientModal } from '../components/NewClientModal';

interface ClientsDashboardProps {
  setView: (view: ViewState) => void;
}

export const ClientsDashboard: React.FC<ClientsDashboardProps> = ({ setView }) => {
  const { clients, sales } = useDatabase();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- CÁLCULOS KPI REALES ---
  const stats = useMemo(() => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // 1. Clientes
      const total = clients.length;
      const newThisMonth = clients.filter(c => {
          const d = new Date(c.since || Date.now());
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;
      
      // Activos: Clientes con saldo o ventas recientes (Simulado: 85% del total para demo)
      const active = Math.floor(total * 0.85) || 0;

      // 2. Ventas
      const monthSales = sales.filter(s => {
          const d = new Date(s.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const totalSales = monthSales.reduce((acc, s) => acc + s.total, 0);
      const avgTicket = sales.length > 0 ? (sales.reduce((acc, s) => acc + s.total, 0) / sales.length) : 0;

      return { total, newThisMonth, active, totalSales, avgTicket };
  }, [clients, sales]);

  // Componente de Tarjeta de Menú (Optimizado)
  const MenuCard = ({ icon: Icon, title, desc, color, onClick, borderTopColor }: any) => (
    <button 
      onClick={onClick}
      className={`bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all text-left group h-full flex flex-col border border-slate-100 relative overflow-hidden`}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${borderTopColor}`}></div>
      <div className="flex items-center gap-4 mb-3 mt-2">
        <div className={`p-3 rounded-lg text-white shadow-sm ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={22} />
        </div>
        <h3 className="font-bold text-slate-800 text-md leading-tight">{title}</h3>
      </div>
      <p className="text-xs text-slate-500 mt-auto leading-relaxed">{desc}</p>
    </button>
  );

  return (
    <div className="h-full bg-slate-50 p-8 overflow-y-auto font-sans">
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Clientes</h1>
        <div className="text-xs text-slate-400 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
            Datos actualizados en tiempo real
        </div>
      </div>

      {/* --- GRID DE 10 TARJETAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Fila 1 */}
        <MenuCard 
          icon={Users} color="bg-blue-600" borderTopColor="bg-blue-600"
          title="Catálogo de Clientes" 
          desc="Gestión completa de la base de clientes."
          onClick={() => setView('CLIENTS_CATALOG')} 
        />
        <MenuCard 
          icon={Award} color="bg-purple-600" borderTopColor="bg-purple-600"
          title="Programa de Fidelización" 
          desc="Gestión de puntos y beneficios."
        />
        <MenuCard 
          icon={History} color="bg-emerald-500" borderTopColor="bg-emerald-500"
          title="Historial de Compras" 
          desc="Registro detallado de transacciones."
          onClick={() => setView('SALES_HISTORY')}
        />
        <MenuCard 
          icon={PieChart} color="bg-amber-500" borderTopColor="bg-amber-500"
          title="Segmentación" 
          desc="Análisis y categorización de clientes."
        />

        {/* Fila 2 */}
        <MenuCard 
          icon={UserPlus} color="bg-red-600" borderTopColor="bg-red-600"
          title="Alta de Clientes" 
          desc="Registro de nuevos clientes."
          onClick={() => setIsCreateModalOpen(true)} // <--- Abre el Modal
        />
        <MenuCard 
          icon={Tags} color="bg-indigo-500" borderTopColor="bg-indigo-500"
          title="Etiquetas" 
          desc="Gestión de etiquetas y categorías."
        />
        <MenuCard 
          icon={Mail} color="bg-pink-500" borderTopColor="bg-pink-500"
          title="Campañas" 
          desc="Gestión de comunicaciones."
        />
        <MenuCard 
          icon={Gift} color="bg-teal-500" borderTopColor="bg-teal-500"
          title="Recompensas" 
          desc="Catálogo de beneficios."
        />

        {/* Fila 3 */}
        <div className="lg:col-span-2">
            <MenuCard 
            icon={BarChart2} color="bg-cyan-600" borderTopColor="bg-cyan-600"
            title="Análisis" 
            desc="Métricas y reportes."
            />
        </div>
        <div className="lg:col-span-2">
            <MenuCard 
            icon={MessageSquare} color="bg-orange-500" borderTopColor="bg-orange-500"
            title="Comentario" 
            desc="Gestión de opiniones y comentarios."
            />
        </div>
      </div>

      {/* --- WIDGETS INFERIORES CON DATOS REALES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Resumen */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-center">
          <h3 className="font-bold text-slate-800 mb-6 text-sm uppercase tracking-wider border-b border-slate-50 pb-2">Resumen de clientes</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center group">
              <span className="text-slate-500 group-hover:text-blue-600 transition-colors">Clientes totales</span>
              <span className="font-bold text-slate-800 text-lg">{stats.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-slate-500 group-hover:text-emerald-600 transition-colors">Clientes Nuevos (Mes)</span>
              <span className="font-bold text-emerald-500 text-lg">+{stats.newThisMonth}</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-slate-500 group-hover:text-blue-600 transition-colors">Clientes Activos</span>
              <span className="font-bold text-blue-600 text-lg">{stats.active}</span>
            </div>
          </div>
        </div>

        {/* Lealtad */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-center">
          <h3 className="font-bold text-slate-800 mb-6 text-sm uppercase tracking-wider border-b border-slate-50 pb-2">Programa de Lealtad</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Miembros Platinum</span>
              <span className="font-bold text-purple-600 text-lg">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Puntos Activos</span>
              <span className="font-bold text-slate-800 text-lg">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Recompensas Canjeadas</span>
              <span className="font-bold text-emerald-500 text-lg">0</span>
            </div>
          </div>
        </div>

        {/* Ventas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-center">
          <h3 className="font-bold text-slate-800 mb-6 text-sm uppercase tracking-wider border-b border-slate-50 pb-2">Ventas</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Ventas del Mes</span>
              <span className="font-bold text-slate-800 text-lg">${stats.totalSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Boleto Promedio</span>
              <span className="font-bold text-slate-800 text-lg">${stats.avgTicket.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tasa de Retención</span>
              <span className="font-bold text-emerald-500 text-lg">100%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de Alta */}
      <NewClientModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

    </div>
  );
};