import React from 'react';
import { 
  Users, Award, History, PieChart, UserPlus, 
  Tags, Mail, Gift, BarChart2, MessageSquare, 
  TrendingUp, ArrowUpRight 
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState } from '../types';

interface ClientsDashboardProps {
  setView: (view: ViewState) => void;
}

export const ClientsDashboard: React.FC<ClientsDashboardProps> = ({ setView }) => {
  const { clients, sales } = useDatabase();

  // --- DATOS REALES PARA LOS WIDGETS DE ABAJO ---
  const totalClients = clients.length;
  // Clientes nuevos este mes (simulado con fecha actual para ejemplo)
  const newClientsThisMonth = clients.filter(c => new Date(c.since).getMonth() === new Date().getMonth()).length;
  
  // Calcular ventas del mes
  const currentMonthSales = sales
    .filter(s => new Date(s.date).getMonth() === new Date().getMonth())
    .reduce((sum, s) => sum + s.total, 0);

  const averageTicket = sales.length > 0 ? (sales.reduce((sum, s) => sum + s.total, 0) / sales.length) : 0;

  // Componente de Tarjeta de Menú
  const MenuCard = ({ icon: Icon, title, desc, color, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-sm border-t-4 hover:shadow-md transition-all text-left group h-full flex flex-col`}
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-3 rounded-xl text-white shadow-sm" style={{ backgroundColor: color }}>
          <Icon size={24} />
        </div>
        <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{title}</h3>
      </div>
      <p className="text-sm text-slate-500 mt-auto">{desc}</p>
    </button>
  );

  return (
    <div className="h-full bg-slate-50 p-8 overflow-y-auto">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Clientes y CRM</h1>
        <p className="text-slate-500">Gestiona relaciones, lealtad y marketing.</p>
      </div>

      {/* --- GRID DE MENÚ SUPERIOR (4 COLUMNAS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Fila 1 */}
        <MenuCard 
          icon={Users} color="#3B82F6" 
          title="Catálogo de Clientes" 
          desc="Gestión completa de la base de datos de clientes."
          onClick={() => alert("Aquí abrirías la lista de clientes (Próximamente)")} 
        />
        <MenuCard 
          icon={Award} color="#8B5CF6" 
          title="Programa de Fidelización" 
          desc="Gestión de puntos y beneficios."
        />
        <MenuCard 
          icon={History} color="#10B981" 
          title="Historial de Compras" 
          desc="Registro detallado de transacciones por cliente."
        />
        <MenuCard 
          icon={PieChart} color="#F59E0B" 
          title="Segmentación" 
          desc="Análisis y categorización de clientes."
        />

        {/* Fila 2 */}
        <MenuCard 
          icon={UserPlus} color="#EF4444" 
          title="Alta de Clientes" 
          desc="Registro rápido de nuevos clientes."
          // Aquí podríamos abrir un modal de registro
        />
        <MenuCard 
          icon={Tags} color="#6366F1" 
          title="Etiquetas" 
          desc="Gestión de etiquetas y categorías VIP."
        />
        <MenuCard 
          icon={Mail} color="#EC4899" 
          title="Campañas" 
          desc="Gestión de comunicaciones y mailing."
        />
        <MenuCard 
          icon={Gift} color="#14B8A6" 
          title="Recompensas" 
          desc="Catálogo de beneficios canjeables."
        />

        {/* Fila 3 */}
        <MenuCard 
          icon={BarChart2} color="#06B6D4" 
          title="Análisis" 
          desc="Métricas de retención y reportes."
        />
        <MenuCard 
          icon={MessageSquare} color="#F97316" 
          title="Comentarios" 
          desc="Gestión de opiniones y feedback."
        />
      </div>

      {/* --- WIDGETS DE RESUMEN INFERIOR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Resumen Clientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 border-b pb-2">Resumen de clientes</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Clientes totales</span>
              <span className="font-bold text-xl text-slate-800">{totalClients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Clientes Nuevos (Mes)</span>
              <span className="font-bold text-xl text-green-500">+{newClientsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Clientes Activos</span>
              <span className="font-bold text-xl text-blue-500">{Math.floor(totalClients * 0.8)}</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Programa Lealtad */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 border-b pb-2">Programa de Lealtad</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Miembros Platinum</span>
              <span className="font-bold text-xl text-purple-500">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Puntos Activos</span>
              <span className="font-bold text-xl text-slate-800">234,567</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Canjes este mes</span>
              <span className="font-bold text-xl text-green-500">89</span>
            </div>
          </div>
        </div>

        {/* Widget 3: Ventas CRM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 border-b pb-2">Ventas</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Ventas del Mes</span>
              <span className="font-bold text-xl text-slate-800">${currentMonthSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Ticket Promedio</span>
              <span className="font-bold text-xl text-slate-800">${averageTicket.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tasa de Retención</span>
              <span className="font-bold text-xl text-green-500 flex items-center gap-1">
                <TrendingUp size={16}/> 78%
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};