import React, { useState } from 'react';
import { 
  Users, Award, History, PieChart, UserPlus, 
  Tags, Mail, Gift, BarChart2, MessageSquare, 
  TrendingUp, ArrowUpRight
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

  // Mocks de datos para los widgets
  const totalClients = clients.length;
  const newClientsThisMonth = 45; // Dato simulado según tu imagen
  const currentMonthSales = 123456;
  const averageTicket = 84.50;

  // Componente de Tarjeta de Menú (Estilo exacto de la imagen)
  const MenuCard = ({ icon: Icon, title, desc, color, onClick, borderTopColor }: any) => (
    <button 
      onClick={onClick}
      className={`bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all text-left group h-full flex flex-col border border-slate-100 relative overflow-hidden`}
    >
      <div className={`absolute top-0 left-0 w-full h-1.5 ${borderTopColor}`}></div>
      <div className="flex items-center gap-4 mb-3 mt-2">
        <div className={`p-3 rounded-lg text-white shadow-sm ${color}`}>
          <Icon size={22} />
        </div>
        <h3 className="font-bold text-slate-800 text-md leading-tight">{title}</h3>
      </div>
      <p className="text-xs text-slate-500 mt-auto leading-relaxed">{desc}</p>
    </button>
  );

  return (
    <div className="h-full bg-slate-50 p-8 overflow-y-auto">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Clientes</h1>
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
          onClick={() => setIsCreateModalOpen(true)} // <--- Aquí abre el modal
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

        {/* Fila 3 (2 elementos) */}
        <MenuCard 
          icon={BarChart2} color="bg-cyan-600" borderTopColor="bg-cyan-600"
          title="Análisis" 
          desc="Métricas y reportes."
        />
        <MenuCard 
          icon={MessageSquare} color="bg-orange-500" borderTopColor="bg-orange-500"
          title="Comentario" 
          desc="Gestión de opiniones y comentarios."
        />
      </div>

      {/* --- WIDGETS INFERIORES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Resumen */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 text-sm">Resumen de clientes</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Clientes totales</span>
              <span className="font-bold text-slate-800">{totalClients.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Clientes Nuevos (Mes)</span>
              <span className="font-bold text-green-500">+{newClientsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Clientes Activos</span>
              <span className="font-bold text-blue-500">892</span>
            </div>
          </div>
        </div>

        {/* Lealtad */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 text-sm">Programa de Lealtad</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Miembros Platinum</span>
              <span className="font-bold text-purple-500">124</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Puntos Activos</span>
              <span className="font-bold text-slate-800">234.567</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Recompensas Canjeadas</span>
              <span className="font-bold text-green-500">89</span>
            </div>
          </div>
        </div>

        {/* Ventas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 text-sm">Ventas</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Ventas del Mes</span>
              <span className="font-bold text-slate-800">${currentMonthSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Boleto Promedio</span>
              <span className="font-bold text-slate-800">${averageTicket.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tasa de Retención</span>
              <span className="font-bold text-green-500">78%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de Alta (Se abre con la tarjeta roja) */}
      <NewClientModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

    </div>
  );
};