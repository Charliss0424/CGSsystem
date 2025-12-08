import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Settings, 
  LogOut, 
  Users,       // Icono para Clientes
  Wallet       // Icono para Créditos/Cobranza
} from 'lucide-react';
import { ViewState } from '../types';
import { useDatabase } from '../context/DatabaseContext';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { logout } = useDatabase();

  const menuItems = [
    { id: 'DASHBOARD', label: 'Inicio', icon: LayoutDashboard },
    { id: 'POS', label: 'Terminal PV', icon: ShoppingCart },
    { id: 'INVENTORY', label: 'Inventario', icon: Package },
    { id: 'SALES', label: 'Historial Ventas', icon: History },
    // --- NUEVOS MÓDULOS ---
    { id: 'CLIENTS_DASHBOARD', label: 'Clientes', icon: Users },
    { id: 'ACCOUNTS_RECEIVABLE', label: 'Créditos y Cobros', icon: Wallet },
    // ----------------------
    { id: 'SETTINGS', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 shadow-xl z-50">
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl text-white">N</div>
        <h1 className="text-xl font-bold tracking-tight">NexPOS</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-medium' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};